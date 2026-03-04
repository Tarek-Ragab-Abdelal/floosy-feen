'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Github,
  Linkedin,
  Briefcase,
  Code2,
  ArrowLeft,
  Languages,
  Wallet,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DEVELOPER, SITE_URL } from '../config';

const content = {
  en: {
    dir: 'ltr' as const,
    back: 'Back to App',
    toggleLang: 'عربي',
    hero: {
      greeting: 'Hi, I\'m',
      name: DEVELOPER.name,
      tagline: 'Full-Stack Developer & Finance Enthusiast',
      bio: `I'm a passionate software developer who built Floosy Feen to solve a real problem: 
      keeping track of money across multiple currencies without handing personal data to a third party. 
      Every byte of your financial data stays on your device — private, secure, and always available offline.`,
    },
    links: {
      title: 'Find me online',
      portfolio: 'Portfolio',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      upwork: 'Upwork',
    },
    app: {
      title: 'About Floosy Feen',
      subtitle: '"Floosy Feen?" means "Where\'s my money?" in Egyptian Arabic — the question every budgeter asks.',
      description: `Floosy Feen is a 100% client-side personal finance tracker. 
      There is no server, no account, and no subscription fee. 
      Your data lives in your browser's IndexedDB and never leaves your device.`,
      features: [
        {
          icon: Wallet,
          title: 'Budget Streams',
          desc: 'Organise your money into named streams — a wallet, a bank account, a savings jar — and track each independently.',
        },
        {
          icon: Zap,
          title: 'Smart Automation',
          desc: 'Set up recurring transactions and automations so your regular income and expenses are logged automatically.',
        },
        {
          icon: Globe,
          title: 'Multi-Currency',
          desc: 'Live exchange rates let you track finances in EGP, USD, EUR, and dozens more currencies simultaneously.',
        },
        {
          icon: ShieldCheck,
          title: 'Privacy First',
          desc: 'No account required. No data ever sent to a server. Full offline support via IndexedDB.',
        },
      ],
    },
    tech: {
      title: 'Tech Stack',
      items: [
        { label: 'Framework', value: 'Next.js 16 (Static Export)' },
        { label: 'Language', value: 'TypeScript' },
        { label: 'Styling', value: 'Tailwind CSS 4' },
        { label: 'Storage', value: 'IndexedDB (idb)' },
        { label: 'Charts', value: 'Recharts' },
        { label: 'Icons', value: 'Lucide React' },
        { label: 'Hosting', value: 'GitHub Pages' },
      ],
    },
    cta: {
      text: 'Want a similar project?',
      button: 'Hire me on Upwork',
    },
  },

  ar: {
    dir: 'rtl' as const,
    back: 'العودة للتطبيق',
    toggleLang: 'English',
    hero: {
      greeting: 'أهلاً، أنا',
      name: 'طارق رجب',
      tagline: 'مطوّر تطبيقات وعاشق لعالم المال والبرمجة',
      bio: `أنا مطوّر برمجيات شغوف بنيت "فلوسي فين" لحل مشكلة حقيقية:
      تتبّع الأموال بعملات متعددة دون الحاجة لمشاركة بياناتك الشخصية مع أي طرف ثالث.
      كل بيانتك المالية تبقى على جهازك — خاصة، آمنة، ومتاحة دائماً بدون إنترنت.`,
    },
    links: {
      title: 'تواصل معي',
      portfolio: 'ملف الأعمال',
      github: 'جيت هاب',
      linkedin: 'لينكد إن',
      upwork: 'أب ورك',
    },
    app: {
      title: 'عن فلوسي فين',
      subtitle: '"فلوسي فين؟" — السؤال الذي يسأله كل من يحاول تتبّع ماله!',
      description: `فلوسي فين تطبيق لإدارة الأموال الشخصية يعمل بالكامل على جهازك.
      لا سيرفر، لا حساب، لا اشتراك شهري.
      بياناتك محفوظة في قاعدة بيانات المتصفح ولا تغادر جهازك أبداً.`,
      features: [
        {
          icon: Wallet,
          title: 'تيارات مالية',
          desc: 'نظّم أموالك في تيارات مسماة — محفظة، حساب بنكي، صندوق توفير — وتتبع كل واحد على حدة.',
        },
        {
          icon: Zap,
          title: 'أتمتة ذكية',
          desc: 'أعدّ المعاملات المتكررة والأتمتة لتُسجَّل دخلك ومصروفاتك الدورية تلقائياً.',
        },
        {
          icon: Globe,
          title: 'متعدد العملات',
          desc: 'أسعار الصرف الحية تتيح لك تتبّع أموالك بالجنيه المصري والدولار واليورو وعشرات العملات الأخرى.',
        },
        {
          icon: ShieldCheck,
          title: 'الخصوصية أولاً',
          desc: 'لا حساب مطلوب. لا بيانات تُرسل لأي سيرفر. يعمل بدون إنترنت تماماً.',
        },
      ],
    },
    tech: {
      title: 'التقنيات المستخدمة',
      items: [
        { label: 'الإطار', value: 'Next.js 16 (تصدير ثابت)' },
        { label: 'اللغة', value: 'TypeScript' },
        { label: 'التصميم', value: 'Tailwind CSS 4' },
        { label: 'التخزين', value: 'IndexedDB (idb)' },
        { label: 'الرسوم البيانية', value: 'Recharts' },
        { label: 'الأيقونات', value: 'Lucide React' },
        { label: 'الاستضافة', value: 'GitHub Pages' },
      ],
    },
    cta: {
      text: 'تريد مشروعاً مشابهاً؟',
      button: 'تواصل معي عبر أب ورك',
    },
  },
};

const socialLinks = [
  {
    key: 'portfolio',
    href: DEVELOPER.portfolio,
    icon: Globe,
    color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
  },
  {
    key: 'github',
    href: DEVELOPER.github,
    icon: Github,
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
  },
  {
    key: 'linkedin',
    href: DEVELOPER.linkedin,
    icon: Linkedin,
    color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50',
  },
  {
    key: 'upwork',
    href: DEVELOPER.upwork,
    icon: Briefcase,
    color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50',
  },
];

export default function AboutClient() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = content[lang];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950"
      dir={t.dir}
      lang={lang}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
          >
            <Languages className="w-4 h-4" />
            {t.toggleLang}
          </button>
        </div>

        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-emerald-200 dark:border-emerald-700 shadow-lg bg-white dark:bg-slate-800 flex items-center justify-center">
            <Image
              src={`${SITE_URL}/logo-no-bg.png`}
              alt={DEVELOPER.name}
              width={112}
              height={112}
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-lg text-gray-500 dark:text-gray-400">{t.hero.greeting}</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-1">
              {t.hero.name}
            </h1>
            <p className="mt-3 text-xl text-emerald-600 dark:text-emerald-400 font-medium">
              {t.hero.tagline}
            </p>
          </div>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed whitespace-pre-line">
            {t.hero.bio}
          </p>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">{t.links.title}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              const label = t.links[link.key as keyof typeof t.links];
              return (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all shadow-sm hover:shadow-md ${link.color}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </a>
              );
            })}
          </div>
        </section>

        {/* About the App */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.app.title}</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium italic">{t.app.subtitle}</p>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto whitespace-pre-line leading-relaxed">
              {t.app.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 pt-2">
            {t.app.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-gray-700"
                >
                  <div className="shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600" />
            {t.tech.title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {t.tech.items.map((item) => (
              <div
                key={item.label}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <p className="text-xl font-semibold">{t.cta.text}</p>
          <a
            href={DEVELOPER.upwork}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-md"
          >
            <Briefcase className="w-5 h-5" />
            {t.cta.button}
          </a>
        </section>

        {/* Open Source */}
        <section className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2 pb-8">
          <p>
            {lang === 'en'
              ? 'Floosy Feen is open source.'
              : 'فلوسي فين مفتوح المصدر.'}
            {' '}
            <a
              href={DEVELOPER.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {lang === 'en' ? 'View on GitHub →' : '← عرض على جيت هاب'}
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
