import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('workspace navigation, language persistence and accessible layouts', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A fresh start for your business.',
  );
  await expect(
    page.getByText('No company data is connected to this preview.', { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-workspace.png`,
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Set your preferences' }).click();
  await page.getByRole('radio', { name: 'বাংলা Bangla' }).check();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.getByRole('status')).toContainText('সংরক্ষিত হয়েছে');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('আরও কিছুটা নিজের মতো।');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-bangla.png`, fullPage: true });
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.goto('/design-system');
  await page.getByRole('button', { name: 'Primary action', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Component examples only' }),
  ).toBeVisible();
  await page.getByLabel('Example input', { exact: true }).fill('বাংলা and English');
  await expect(page.getByRole('button', { name: 'Unavailable action' })).toBeDisabled();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test('keyboard skip link and unknown route recovery', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const response = await page.goto('/not-a-real-route');
  expect(response?.status()).toBe(404);
  await page.getByRole('link', { name: 'Return to workspace' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
