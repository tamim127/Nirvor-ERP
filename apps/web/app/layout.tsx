import type { Metadata, Viewport } from 'next';
import '@nirvor/ui/tokens.css';
import './styles.css';

export const metadata: Metadata = {
  title: 'Nirvor — Your business workspace',
  description: 'Nirvor ERP workspace foundation preview.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#08735e' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
