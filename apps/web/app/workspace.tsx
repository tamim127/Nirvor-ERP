'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Notice } from '@nirvor/ui';

type View = 'home' | 'preferences' | 'components';
type Language = 'en' | 'bn';
const copy = {
  en: {
    workspace: 'Workspace',
    home: 'Overview',
    preferences: 'Preferences',
    components: 'UI foundations',
    preview: 'Workspace preview',
    subtitle: 'Business, under control.',
    greeting: 'A fresh start for your business.',
    intro: 'One thoughtful workspace. Built around the way your company works.',
    company: 'Your company belongs here',
    empty: 'Your workspace is taking shape',
    emptyDetail:
      'Company setup and secure sign-in will arrive in the next phase. No company data is connected to this preview.',
    personalize: 'Make it feel like yours',
    personalizeDetail: 'Choose the language you are most comfortable working in.',
    choose: 'Set your preferences',
    path: 'A workspace that grows with you',
    pathDetail: 'Start with what matters. Add capabilities as your business grows.',
    companyStep: 'One company, many branches',
    companyNote: 'Keep your teams organized around your company.',
    accessStep: 'The right access for every person',
    accessNote: 'Work with clear permissions for each branch and task.',
    featuresStep: 'Features that fit your business',
    featuresNote: 'Your company uses the capabilities it needs.',
    foundation: 'Foundation preview',
    foundationDetail:
      'You are exploring the interface foundation. Business modules and company onboarding are not available yet.',
    language: 'Display language',
    languageDetail:
      'This preference is saved only in this browser. It does not change company settings.',
    saved: 'Your language preference has been saved on this device.',
    saveError: 'Browser storage is unavailable. Your choice applies for this visit only.',
    region: 'Regional starting point',
    regionDetail:
      'Bangladesh · Asia/Dhaka. Company currency and accounting policies will be configured during onboarding.',
    help: 'About this preview',
    helpDetail:
      'This preview contains no customer records. Explore navigation, language preferences and interface components.',
    uiTitle: 'Consistent, clear, accessible.',
    uiDetail: 'A reference for the shared controls and states used across Nirvor.',
    actions: 'Actions',
    primary: 'Primary action',
    secondary: 'Secondary action',
    unavailable: 'Unavailable action',
    states: 'Feedback states',
    loading: 'Loading your information…',
    error: 'We could not load this information. Please try again.',
    success: 'Your changes have been saved.',
    demo: 'Component examples only. No business records are changed.',
    field: 'Example input',
    fieldHint: 'A label and clear guidance stay visible while you type.',
    skip: 'Skip to content',
    footer: 'Designed for your everyday work.',
    settingsTitle: 'A little more personal.',
  },
  bn: {
    workspace: 'কর্মক্ষেত্র',
    home: 'সারসংক্ষেপ',
    preferences: 'পছন্দসমূহ',
    components: 'ইন্টারফেসের ভিত্তি',
    preview: 'কর্মক্ষেত্রের প্রিভিউ',
    subtitle: 'ব্যবসা, আপনার নিয়ন্ত্রণে।',
    greeting: 'আপনার ব্যবসার নতুন শুরু।',
    intro: 'আপনার কোম্পানির কাজের ধরন অনুযায়ী সাজানো একটি সহজ কর্মক্ষেত্র।',
    company: 'আপনার কোম্পানির জন্য',
    empty: 'আপনার কর্মক্ষেত্র তৈরি হচ্ছে',
    emptyDetail:
      'পরবর্তী ধাপে কোম্পানি সেটআপ ও নিরাপদ সাইন-ইন যুক্ত হবে। এই প্রিভিউতে কোনো কোম্পানির তথ্য সংযুক্ত নেই।',
    personalize: 'নিজের মতো সাজিয়ে নিন',
    personalizeDetail: 'যে ভাষায় কাজ করতে স্বাচ্ছন্দ্য বোধ করেন, সেটি বেছে নিন।',
    choose: 'পছন্দ নির্ধারণ করুন',
    path: 'ব্যবসার সঙ্গে বেড়ে উঠবে কর্মক্ষেত্র',
    pathDetail: 'প্রয়োজনীয় সুবিধা দিয়ে শুরু করুন। ব্যবসার সঙ্গে আরও সুবিধা যুক্ত করুন।',
    companyStep: 'এক কোম্পানি, একাধিক শাখা',
    companyNote: 'কোম্পানির অধীনে আপনার দল ও শাখা সংগঠিত রাখুন।',
    accessStep: 'সঠিক ব্যক্তির সঠিক অনুমতি',
    accessNote: 'প্রতিটি শাখা ও কাজের জন্য নির্দিষ্ট অনুমতি রাখুন।',
    featuresStep: 'ব্যবসার প্রয়োজনমতো সুবিধা',
    featuresNote: 'আপনার কোম্পানির প্রয়োজনীয় সুবিধাগুলো ব্যবহার করুন।',
    foundation: 'ভিত্তির প্রিভিউ',
    foundationDetail:
      'এটি ইন্টারফেসের প্রাথমিক ভিত্তি। ব্যবসায়িক মডিউল ও কোম্পানি নিবন্ধন এখনো চালু হয়নি।',
    language: 'প্রদর্শনের ভাষা',
    languageDetail: 'এই পছন্দ শুধু এই ব্রাউজারে সংরক্ষিত হবে। কোম্পানির সেটিংস পরিবর্তিত হবে না।',
    saved: 'আপনার ভাষার পছন্দ এই ডিভাইসে সংরক্ষিত হয়েছে।',
    saveError: 'ব্রাউজারে সংরক্ষণ সম্ভব হয়নি। এই ভিজিট পর্যন্ত আপনার পছন্দ কার্যকর থাকবে।',
    region: 'প্রাথমিক অঞ্চল',
    regionDetail: 'বাংলাদেশ · Asia/Dhaka। কোম্পানি সেটআপের সময় মুদ্রা ও হিসাবের নিয়ম নির্ধারিত হবে।',
    help: 'এই প্রিভিউ সম্পর্কে',
    helpDetail: 'এখানে গ্রাহকের কোনো তথ্য নেই। নেভিগেশন, ভাষা ও ইন্টারফেসের উপাদানগুলো দেখতে পারেন।',
    uiTitle: 'সামঞ্জস্যপূর্ণ, স্পষ্ট ও সহজ।',
    uiDetail: 'নির্ভরের বিভিন্ন অংশে ব্যবহারের জন্য সাধারণ কন্ট্রোল ও অবস্থার উদাহরণ।',
    actions: 'অ্যাকশন',
    primary: 'প্রধান অ্যাকশন',
    secondary: 'বিকল্প অ্যাকশন',
    unavailable: 'অনুপলব্ধ অ্যাকশন',
    states: 'বার্তা ও অবস্থা',
    loading: 'আপনার তথ্য লোড হচ্ছে…',
    error: 'তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।',
    success: 'আপনার পরিবর্তন সংরক্ষিত হয়েছে।',
    demo: 'এগুলো কেবল কম্পোনেন্টের উদাহরণ। ব্যবসায়িক তথ্য পরিবর্তন করা হয় না।',
    field: 'ইনপুটের উদাহরণ',
    fieldHint: 'টাইপ করার সময়ও লেবেল ও সহায়ক নির্দেশনা দেখা যাবে।',
    skip: 'মূল বিষয়ে যান',
    footer: 'আপনার প্রতিদিনের কাজের জন্য।',
    settingsTitle: 'আরও কিছুটা নিজের মতো।',
  },
};

function Icon({
  name,
  size = 20,
}: {
  name: 'home' | 'settings' | 'grid' | 'arrow' | 'building' | 'shield' | 'spark';
  size?: number;
}) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="17" r="3" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    building: (
      <>
        <path d="M5 21V3h14v18M2 21h20M9 7h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M10 21v-3h4v3" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Workspace({ view }: { view: View }) {
  const [language, setLanguage] = useState<Language>('en');
  const [message, setMessage] = useState<'saved' | 'saveError' | null>(null);
  const [demoMessage, setDemoMessage] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nirvor.language');
      if (stored === 'bn') {
        setLanguage('bn');
        document.documentElement.lang = 'bn';
      }
    } catch {
      /* Preference storage is optional, never required for access. */
    }
  }, []);
  const changeLanguage = (next: Language) => {
    setLanguage(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem('nirvor.language', next);
      setMessage('saved');
    } catch {
      setMessage('saveError');
    }
  };
  const text = copy[language];
  const navigation = [
    { href: '/', label: text.home, key: 'home', icon: 'home' },
    { href: '/preferences', label: text.preferences, key: 'preferences', icon: 'settings' },
    { href: '/design-system', label: text.components, key: 'components', icon: 'grid' },
  ] as const;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        {text.skip}
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Nirvor home">
          <span className="brand-mark">
            n<span>·</span>
          </span>
          <span>
            nirvor<span className="brand-caption">ERP WORKSPACE</span>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="workspace-monogram">N</span>
          <div>
            <strong>{text.workspace}</strong>
            <span>{text.preview}</span>
          </div>
        </div>
        <p className="nav-label">{text.workspace}</p>
        <nav aria-label={text.workspace}>
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-item ${view === item.key ? 'active' : ''}`}
              aria-current={view === item.key ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="small-mark">✳</span>
          <p>{text.subtitle}</p>
          <span>NIRVOR ERP · FOUNDATION</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Nirvor</span>
            <span aria-hidden="true">/</span>
            <strong>{navigation.find((item) => item.key === view)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="preview-dot" aria-hidden="true" />
            <span className="preview-label">{text.preview}</span>
            <button
              type="button"
              className="language-button"
              onClick={() => changeLanguage(language === 'en' ? 'bn' : 'en')}
              aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
        </header>
        <main id="main" className="content" tabIndex={-1}>
          <div className="page-heading">
            <p className="eyebrow">
              {view === 'home'
                ? 'NIRVOR WORKSPACE'
                : view === 'preferences'
                  ? text.preferences
                  : text.components}
            </p>
            <h1>
              {view === 'home'
                ? text.greeting
                : view === 'preferences'
                  ? text.settingsTitle
                  : text.uiTitle}
            </h1>
            <p>
              {view === 'home'
                ? text.intro
                : view === 'preferences'
                  ? text.languageDetail
                  : text.uiDetail}
            </p>
          </div>
          {view === 'home' && (
            <>
              <div className="overview-grid">
                <Card className="company-card">
                  <div className="section-heading">
                    <h2>{text.company}</h2>
                    <Badge>{text.foundation}</Badge>
                  </div>
                  <div className="empty-workspace">
                    <div className="empty-art" aria-hidden="true">
                      <div className="art-tile art-tile-back" />
                      <div className="art-tile">
                        <Icon name="building" size={38} />
                        <span />
                        <span />
                      </div>
                      <div className="art-spark">
                        <Icon name="spark" size={19} />
                      </div>
                    </div>
                    <h3>{text.empty}</h3>
                    <p>{text.emptyDetail}</p>
                  </div>
                </Card>
                <Card className="personalize-card">
                  <div className="feature-icon">
                    <Icon name="settings" size={25} />
                  </div>
                  <h2>{text.personalize}</h2>
                  <p>{text.personalizeDetail}</p>
                  <Link className="button button--primary" href="/preferences">
                    {text.choose}
                    <Icon name="arrow" size={17} />
                  </Link>
                  <div className="language-preview" aria-hidden="true">
                    <span>আ</span>
                    <span>Aa</span>
                  </div>
                </Card>
              </div>
              <Card className="journey-card">
                <div className="section-heading">
                  <div>
                    <h2>{text.path}</h2>
                    <p>{text.pathDetail}</p>
                  </div>
                  <Icon name="spark" />
                </div>
                <div className="journey-grid">
                  {[
                    { icon: 'building', title: text.companyStep, detail: text.companyNote },
                    { icon: 'shield', title: text.accessStep, detail: text.accessNote },
                    { icon: 'grid', title: text.featuresStep, detail: text.featuresNote },
                  ].map((item, index) => (
                    <div className="journey-item" key={item.title}>
                      <span className="step-number">0{index + 1}</span>
                      <Icon name={item.icon as 'building' | 'shield' | 'grid'} />
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <details className="preview-help">
                <summary>{text.help}</summary>
                <p>{text.helpDetail}</p>
              </details>
            </>
          )}
          {view === 'preferences' && (
            <div className="settings-grid">
              <Card>
                <h2>{text.language}</h2>
                <p className="muted">{text.languageDetail}</p>
                <fieldset className="language-choices">
                  <legend className="sr-only">{text.language}</legend>
                  {(['en', 'bn'] as const).map((locale) => (
                    <label
                      key={locale}
                      className={`language-choice ${language === locale ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="language"
                        value={locale}
                        checked={language === locale}
                        onChange={() => changeLanguage(locale)}
                      />
                      <span>
                        <strong lang={locale}>{locale === 'en' ? 'English' : 'বাংলা'}</strong>
                        <small>{locale === 'en' ? 'English' : 'Bangla'}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>
                {message && (
                  <Notice tone={message === 'saved' ? 'success' : 'error'}>{text[message]}</Notice>
                )}
              </Card>
              <Card>
                <span className="region-symbol" aria-hidden="true">
                  BD
                </span>
                <h2>{text.region}</h2>
                <p className="muted">{text.regionDetail}</p>
              </Card>
            </div>
          )}
          {view === 'components' && (
            <div className="component-grid">
              <Card>
                <h2>{text.actions}</h2>
                <p className="muted">{text.demo}</p>
                <div className="button-row">
                  <Button onClick={() => setDemoMessage(true)}>{text.primary}</Button>
                  <Button variant="secondary" onClick={() => setDemoMessage(false)}>
                    {text.secondary}
                  </Button>
                  <Button disabled>{text.unavailable}</Button>
                </div>
                {demoMessage && <Notice>{text.demo}</Notice>}
                <label className="field-label" htmlFor="example-field">
                  {text.field}
                </label>
                <input
                  id="example-field"
                  className="text-input"
                  aria-describedby="field-hint"
                  maxLength={100}
                />
                <p id="field-hint" className="field-hint">
                  {text.fieldHint}
                </p>
              </Card>
              <Card>
                <h2>{text.states}</h2>
                <div className="state-stack">
                  <Notice>{text.loading}</Notice>
                  <Notice tone="error">{text.error}</Notice>
                  <Notice tone="success">{text.success}</Notice>
                  <div className="button-row">
                    <Badge tone="success">{language === 'en' ? 'Available' : 'উপলব্ধ'}</Badge>
                    <Badge tone="warning">
                      {language === 'en' ? 'Needs attention' : 'মনোযোগ প্রয়োজন'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <footer className="page-footer">
            <span>
              nirvor<span className="brand-dot">.</span>
            </span>
            <p>{text.footer}</p>
          </footer>
        </main>
      </div>
      <nav
        className="mobile-nav"
        aria-label={language === 'en' ? 'Mobile navigation' : 'মোবাইল নেভিগেশন'}
      >
        {navigation.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={view === item.key ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
