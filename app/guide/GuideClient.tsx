'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Languages,
  Wallet,
  Plus,
  RefreshCw,
  BarChart2,
  CreditCard,
  Download,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  tips: string[];
}

interface FAQ {
  q: string;
  a: string;
}

interface Content {
  dir: 'ltr' | 'rtl';
  back: string;
  toggleLang: string;
  hero: { title: string; subtitle: string };
  intro: string;
  stepsTitle: string;
  steps: Step[];
  faqTitle: string;
  faqs: FAQ[];
  cta: { text: string; button: string; href: string };
}

const content: Record<'en' | 'ar', Content> = {
  en: {
    dir: 'ltr',
    back: 'Back to App',
    toggleLang: 'عربي',
    hero: {
      title: 'How to Use Floosy Feen',
      subtitle: 'Your complete guide to taking control of your finances — offline, private, and free.',
    },
    intro: `Floosy Feen organises your money around "Streams" — think of a stream as a bank account, a wallet, or any pot of money you want to track. 
    Everything starts by creating your first stream, and the rest follows naturally.`,
    stepsTitle: 'Getting Started: Step by Step',
    steps: [
      {
        number: 1,
        icon: Wallet,
        title: 'Create a Stream',
        description:
          'A stream represents any bucket of money: a bank account, a cash wallet, a savings jar, or even a credit card. Start by tapping "Create Stream" on the Home screen.',
        tips: [
          'Name it clearly, e.g. "EGP Wallet", "HSBC Savings", "Emergency Fund".',
          'Choose the base currency of that account.',
          'For credit cards, enable the credit card toggle and enter your limit.',
          'Set an initial balance to reflect what\'s already in that account.',
        ],
      },
      {
        number: 2,
        icon: Plus,
        title: 'Log a Transaction',
        description:
          'Record every income or expense against a stream. Go to the Transactions tab and tap "New Transaction".',
        tips: [
          'Choose "Income" for money coming in (salary, freelance, etc.) or "Expense" for money going out.',
          'Set the applicability date — this is the date the money was received or spent.',
          'Add optional notes or tags for better organisation.',
          'The balance on the Home screen updates instantly.',
        ],
      },
      {
        number: 3,
        icon: RefreshCw,
        title: 'Set Up Automations',
        description:
          'Automation lets you schedule recurring income and expenses so they appear automatically. Go to the Automation tab to create rules.',
        tips: [
          'Use "Recurrence" for regular transactions like monthly rent or weekly grocery budgets.',
          'Use "Automation" for conditional rules, e.g. automatically move money when a balance threshold is crossed.',
          'Automations project future transactions so you can see your balance weeks or months ahead.',
        ],
      },
      {
        number: 4,
        icon: BarChart2,
        title: 'Read the Balance Projections',
        description:
          'The date selector on the Home screen lets you travel forward or backward in time to see your projected balance on any given date.',
        tips: [
          'Tap the date selector and pick a future date to preview your projected balance.',
          'Projected transactions appear in the stream cards with a dashed style.',
          'All projections are based on your automations and recurrences.',
        ],
      },
      {
        number: 5,
        icon: CreditCard,
        title: 'Track Credit Cards',
        description:
          'Credit card streams work differently — they track your outstanding balance (usage vs. limit) and deduct it from your net worth automatically.',
        tips: [
          'Mark a stream as "Credit Card" when creating it.',
          'Enter your credit limit and current outstanding balance.',
          'Expenses logged to a credit card stream increase the outstanding amount.',
          'Payments (income transactions) reduce the outstanding amount.',
        ],
      },
      {
        number: 6,
        icon: Download,
        title: 'Export & Backup Your Data',
        description:
          'All your data is stored locally on your device. Use the Export feature in Settings to back it up regularly.',
        tips: [
          'Export as CSV for use in spreadsheet apps like Excel or Google Sheets.',
          'Export as JSON for a full backup that can be used to migrate data.',
          'Set a date range to export only the transactions you need.',
        ],
      },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'Is my data sent to any server?',
        a: 'No. Floosy Feen is a 100% client-side app. Your data never leaves your browser. It is stored in IndexedDB — a local browser database.',
      },
      {
        q: 'What happens if I clear my browser data?',
        a: 'Your Floosy Feen data will be deleted along with other site data. Always export a JSON backup regularly to prevent data loss.',
      },
      {
        q: 'Can I use multiple currencies?',
        a: 'Yes! Each stream has its own base currency. The app fetches live exchange rates and converts everything to your primary currency for the total balance view.',
      },
      {
        q: 'Does the app work offline?',
        a: 'Yes. All calculations and data storage happen locally. You only need internet to fetch live exchange rates — the rest works completely offline.',
      },
      {
        q: 'How do projections work?',
        a: 'When you create automations or recurrences, the app generates projected transactions into the future. Selecting a future date on the home screen shows your estimated balance on that date.',
      },
    ],
    cta: {
      text: 'Ready to get started?',
      button: 'Open the App',
      href: '/home',
    },
  },

  ar: {
    dir: 'rtl',
    back: 'العودة للتطبيق',
    toggleLang: 'English',
    hero: {
      title: 'كيفية استخدام فلوسي فين',
      subtitle: 'دليلك الكامل للتحكم في أموالك — بدون إنترنت، خصوصية تامة، ومجاناً.',
    },
    intro: `فلوسي فين ينظّم أموالك عبر "تيارات" — فكّر في التيار كحساب بنكي أو محفظة نقدية أو أي وعاء مالي تريد تتبّعه.
    كل شيء يبدأ بإنشاء تيارك الأول، والباقي يتبع بشكل طبيعي.`,
    stepsTitle: 'البدء: خطوة بخطوة',
    steps: [
      {
        number: 1,
        icon: Wallet,
        title: 'أنشئ تياراً مالياً',
        description:
          'التيار يمثّل أي مصدر أو وعاء للمال: حساب بنكي، محفظة نقدية، صندوق توفير، أو حتى بطاقة ائتمان. ابدأ بالضغط على "إنشاء تيار" في الشاشة الرئيسية.',
        tips: [
          'سمّه بوضوح، مثلاً: "محفظة الجنيه"، "حساب CIB"، "صندوق الطوارئ".',
          'اختر العملة الأساسية لهذا الحساب.',
          'لبطاقات الائتمان، فعّل خيار "بطاقة ائتمان" وأدخل الحد الائتماني.',
          'حدد الرصيد الأولي ليعكس ما هو موجود بالفعل.',
        ],
      },
      {
        number: 2,
        icon: Plus,
        title: 'سجّل معاملة',
        description:
          'سجّل كل دخل أو مصروف مقابل تيار. اذهب إلى تبويب "المعاملات" واضغط "معاملة جديدة".',
        tips: [
          'اختر "دخل" للأموال الواردة (راتب، مشاريع مستقلة، إلخ) أو "مصروف" للأموال الخارجة.',
          'حدد تاريخ التطبيق — وهو التاريخ الذي استُلم أو صُرف فيه المبلغ.',
          'أضف ملاحظات أو وسوم اختيارية لتنظيم أفضل.',
          'يُحدَّث الرصيد في الشاشة الرئيسية فوراً.',
        ],
      },
      {
        number: 3,
        icon: RefreshCw,
        title: 'أعدّ الأتمتة',
        description:
          'تتيح الأتمتة جدولة الدخل والمصروفات المتكررة لتظهر تلقائياً. اذهب إلى تبويب "الأتمتة" لإنشاء قواعد.',
        tips: [
          'استخدم "التكرار" للمعاملات المنتظمة كالإيجار الشهري أو ميزانية البقالة الأسبوعية.',
          'استخدم "الأتمتة" للقواعد الشرطية، مثلاً نقل المال تلقائياً عند عبور حد الرصيد.',
          'تُسقط الأتمتة معاملات مستقبلية لترى رصيدك بعد أسابيع أو أشهر.',
        ],
      },
      {
        number: 4,
        icon: BarChart2,
        title: 'اقرأ توقعات الرصيد',
        description:
          'محدد التاريخ في الشاشة الرئيسية يتيح لك السفر للأمام أو للخلف لرؤية رصيدك المتوقع في أي تاريخ.',
        tips: [
          'اضغط على محدد التاريخ واختر تاريخاً مستقبلياً لمعاينة رصيدك المتوقع.',
          'المعاملات المتوقعة تظهر في بطاقات التيارات بنمط منقّط.',
          'جميع التوقعات مبنية على أتمتتك وتكراراتك.',
        ],
      },
      {
        number: 5,
        icon: CreditCard,
        title: 'تتبّع بطاقات الائتمان',
        description:
          'تيارات بطاقات الائتمان تعمل بشكل مختلف — تتتبع رصيدك القائم (الاستخدام مقابل الحد) وتخصمه تلقائياً من صافي ثروتك.',
        tips: [
          'علّم التيار كـ"بطاقة ائتمان" عند إنشائه.',
          'أدخل الحد الائتماني والرصيد القائم الحالي.',
          'المصروفات المسجّلة على تيار البطاقة تزيد المبلغ القائم.',
          'المدفوعات (معاملات الدخل) تقلّل المبلغ القائم.',
        ],
      },
      {
        number: 6,
        icon: Download,
        title: 'تصدير البيانات والنسخ الاحتياطي',
        description:
          'جميع بياناتك مخزنة محلياً على جهازك. استخدم ميزة التصدير في الإعدادات للنسخ الاحتياطي بانتظام.',
        tips: [
          'صدّر كـCSV للاستخدام في جداول البيانات مثل Excel أو Google Sheets.',
          'صدّر كـJSON لنسخة احتياطية كاملة يمكن استخدامها لترحيل البيانات.',
          'حدد نطاقاً زمنياً لتصدير المعاملات التي تحتاجها فقط.',
        ],
      },
    ],
    faqTitle: 'الأسئلة الشائعة',
    faqs: [
      {
        q: 'هل يتم إرسال بياناتي لأي سيرفر؟',
        a: 'لا. فلوسي فين تطبيق يعمل بالكامل على جهازك. بياناتك لا تغادر المتصفح أبداً. محفوظة في IndexedDB — قاعدة بيانات المتصفح المحلية.',
      },
      {
        q: 'ماذا يحدث إذا مسحت بيانات المتصفح؟',
        a: 'ستُحذف بيانات فلوسي فين مع بيانات الموقع الأخرى. احرص دائماً على تصدير نسخة احتياطية JSON بانتظام لتفادي فقدان البيانات.',
      },
      {
        q: 'هل يمكنني استخدام عملات متعددة؟',
        a: 'نعم! لكل تيار عملته الأساسية الخاصة. يجلب التطبيق أسعار الصرف الحية ويحوّل كل شيء إلى عملتك الأساسية لعرض إجمالي الرصيد.',
      },
      {
        q: 'هل يعمل التطبيق بدون إنترنت؟',
        a: 'نعم. جميع الحسابات وتخزين البيانات تتم محلياً. تحتاج الإنترنت فقط لجلب أسعار الصرف الحية — والباقي يعمل بالكامل بدون إنترنت.',
      },
      {
        q: 'كيف تعمل توقعات الرصيد؟',
        a: 'عند إنشاء أتمتة أو تكرارات، يولّد التطبيق معاملات متوقعة في المستقبل. اختيار تاريخ مستقبلي في الشاشة الرئيسية يُظهر رصيدك التقديري في ذلك التاريخ.',
      },
    ],
    cta: {
      text: 'مستعد للبدء؟',
      button: 'افتح التطبيق',
      href: '/home',
    },
  },
};

export default function GuideClient() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-2">
            <HelpCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {t.hero.title}
          </h1>
          <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {t.intro}
          </p>
        </section>

        {/* Steps */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.stepsTitle}</h2>
          <div className="space-y-6">
            {t.steps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.number}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Tips */}
                  <ul className="space-y-2 ps-14">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.faqTitle}</h2>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-start"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{faq.q}</span>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl space-y-4 mb-8">
          <p className="text-xl font-semibold">{t.cta.text}</p>
          <Link
            href={t.cta.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-md"
          >
            <Wallet className="w-5 h-5" />
            {t.cta.button}
          </Link>
        </section>

      </div>
    </div>
  );
}
