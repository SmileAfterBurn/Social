'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, HandHeart, Languages, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { RegionSelector } from '../features/RegionSelector';
import SignLanguageChatPanel from '../features/SignLanguageChatPanel';
import { BrandingFooter } from '@/components/layout/BrandingFooter';
import type { RegionName } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PaniDumkaPremium } from '@/components/features/PaniDumkaPremium';

interface MainMenuProps {
  onRegionSelect?: (region: RegionName) => void;
  className?: string;
}

export default function MainMenu({ onRegionSelect, className }: MainMenuProps) {
  const { lang, setLang } = useLanguage();
  const [isSignLanguageOpen, setIsSignLanguageOpen] = useState(false);
  const [isLanguagePromptOpen, setIsLanguagePromptOpen] = useState(false);
  const [isPaniOpen, setIsPaniOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedLang = window.localStorage.getItem('sab-language');

    if (savedLang === 'uk' || savedLang === 'en') {
      setLang(savedLang);
      return;
    }

    setIsLanguagePromptOpen(true);
  }, [setLang]);

  const chooseLanguage = (nextLang: 'uk' | 'en') => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sab-language', nextLang);
    }
    setIsLanguagePromptOpen(false);
  };

  const copy = useMemo(() => {
    if (lang === 'en') {
      return {
        nav: {
          why: 'Why It Works',
          how: 'How It Works',
          regions: 'Regions',
          sign: 'Sign Language Support',
          openMap: 'Open Map',
          openLanguagePrompt: 'Language',
        },
        hero: {
          badge: 'Inclusive Digital Ecosystem for Social Care · Ukraine',
          titleTop: 'Social Map of Care —',
          titleBottom: 'a digital care platform for everyone',
          text: 'An inclusive care platform: 6,200+ verified organizations, crisis hotlines, and AI assistant Pani Dumka — free and instantly accessible across every region of Ukraine.',
          primaryCta: 'Find support near you',
          secondaryCta: 'Sign language support',
        },
        stats: [
          { value: '6 200+', label: 'verified support locations' },
          { value: '25', label: 'regions covered' },
          { value: '24/7', label: 'access to critical services' },
        ],
        why: {
          eyebrow: 'Чому вибрати Соціальну Мапу Турботи',
          title: 'Built for real people with real needs',
          text: 'Social Map of Care is more than a directory — it is a care hub: a space where everyone finds support without barriers, extra steps, or stress.',
          cards: [
            {
              title: 'Instant search',
              text: 'Open the map, pick a region, and find an address, contact, and service type in under a minute.',
              icon: Sparkles,
            },
            {
              title: 'Inclusive by design',
              text: 'Built for everyone: high contrast, clear hierarchy, large touch targets, and screen reader support.',
              icon: HandHeart,
            },
            {
              title: 'Verified data',
              text: 'Every organization is checked. You see the region, service type, contact, and a clear next step — nothing more.',
              icon: ShieldCheck,
            },
          ],
        },
        how: {
          eyebrow: 'How It Works',
          title: 'Three steps to the support you need',
          text: 'Every screen moves you closer to real help. No detours, no promotional interruptions — just a clear path from question to answer.',
          steps: [
            {
              step: '01',
              title: 'Select your region',
              text: 'Choose all of Ukraine or go directly to your oblast.',
            },
            {
              step: '02',
              title: 'Filter by need',
              text: 'Narrow results by support category and service type on the interactive map.',
            },
            {
              step: '03',
              title: 'Connect with the organization',
              text: 'Get the address, phone number, and key context — everything you need, nothing more.',
            },
          ],
        },
        regions: {
          eyebrow: 'Regions',
          title: 'Your oblast — find local support right away',
          text: 'Select your oblast to see verified support organizations near you — displayed on a live, filterable map.',
          cta: 'Explore all of Ukraine',
        },
        languagePrompt: {
          title: 'Which language works best for you?',
          text: 'I can switch the interface right now so the map and guidance are easier to follow.',
          uk: 'Ukrainian works for me',
          en: 'English is easier',
          action: 'Switch language',
        },
      };
    }

    return {
      nav: {
        why: 'Чому це працює',
        how: 'Як користуватись',
        regions: 'Регіони',
        sign: 'Жестова підтримка',
        openMap: 'Відкрити карту',
        openLanguagePrompt: 'Мова',
      },
      hero: {
        badge: 'Цифрова інклюзивна екосистема соціальної підтримки',
        titleTop: 'Соціальна мапа турботи —',
        titleBottom: 'цифровий омофор для кожного',
        text: 'Інклюзивна екосистема підтримки: 6 200+ верифікованих організацій, гарячі лінії та AI-асистент Пані Думка — безкоштовно та миттєво доступні для кожного регіону України.',
        primaryCta: 'Знайти підтримку поруч',
        secondaryCta: 'Підтримка жестовою мовою',
      },
      stats: [
        { value: '6 200+', label: 'верифікованих точок допомоги' },
        { value: '25', label: 'регіонів на єдиній карті' },
        { value: '24/7', label: 'доступ до критичних сервісів' },
      ],
      why: {
        eyebrow: 'Чому вибрати Соціальну Мапу Турботи',
        title: 'Побудовано для реальних людей з реальними потребами',
        text: 'Соціальна мапа турботи — це не просто каталог. Це цифровий омофор: простір, де кожен знаходить підтримку без зайвих кроків, бар\'єрів та стресу.',
        cards: [
          {
            title: 'Миттєвий пошук',
            text: 'Відкрийте карту, оберіть регіон — і за хвилину маєте адресу, контакт і тип підтримки.',
            icon: Sparkles,
          },
          {
            title: 'Інклюзивний дизайн',
            text: 'Побудовано для всіх: висококонтрастний інтерфейс, велика типографіка, підтримка читачів екрана.',
            icon: HandHeart,
          },
          {
            title: 'Верифіковані дані',
            text: 'Кожна організація перевірена. Ви бачите регіон, тип послуги, контакт і чіткий наступний крок.',
            icon: ShieldCheck,
          },
        ],
      },
      how: {
        eyebrow: 'Як користуватись',
        title: 'Три кроки до потрібної підтримки',
        text: 'Кожен екран наближає вас до реальної допомоги. Жодних зайвих кроків — тільки чіткий шлях від запиту до відповіді.',
        steps: [
          {
            step: '01',
            title: 'Оберіть регіон',
            text: 'Почніть з усієї України або одразу переходьте до своєї області.',
          },
          {
            step: '02',
            title: 'Відфільтруйте за потребою',
            text: 'На карті виберіть категорію підтримки та конкретний тип послуги.',
          },
          {
            step: '03',
            title: 'Зверніться до організації',
            text: 'Отримайте адресу, телефон і ключовий контекст — все потрібне, нічого зайвого.',
          },
        ],
      },
      regions: {
        eyebrow: 'Регіони',
        title: 'Ваш регіон — ваш вхід в екосистему',
        text: 'Виберіть свою область, щоб побачити верифіковані організації поруч із вами — на інтерактивній карті з фільтрами.',
        cta: 'Переглянути всю Україну',
      },
      languagePrompt: {
        title: 'Яка мова вам зручніша?',
        text: 'Я можу зараз переключити інтерфейс, щоб картою та поясненнями було легше користуватись.',
        uk: 'Мені зручна українська',
        en: 'English is easier',
        action: 'Переключити мову',
      },
    };
  }, [lang]);

  return (
    <div className={className} style={{ fontFamily: 'var(--font-outfit)' }}>
      <div className="landing-shell">
        <div className="landing-grid" />

        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,12,18,0.82)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
            <a href="#hero" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                <Image
                  src="/assets/smile-after-burn-logo.png"
                  alt="SmileAfterBurn"
                  width={24}
                  height={24}
                  style={{ filter: 'invert(1)' }}
                />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fdcc6] md:text-sm md:tracking-[0.28em]">Соціальна мапа</div>
                <div className="truncate text-sm font-semibold text-white md:text-base">SmileAfterBurn Care</div>
              </div>
            </a>

            <div className="hidden items-center gap-6 lg:flex">
              {[
                { href: '#why', label: copy.nav.why },
                { href: '#how', label: copy.nav.how },
                { href: '#regions', label: copy.nav.regions },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/68 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
              <button
                type="button"
                onClick={() => setIsLanguagePromptOpen(true)}
                className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white md:px-4 md:text-sm"
              >
                <Languages className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{copy.nav.openLanguagePrompt}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSignLanguageOpen(true)}
                className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white md:px-4 md:text-sm"
              >
                <span className="hidden sm:inline">{copy.nav.sign}</span>
                <span className="sm:hidden">ЖМ</span>
              </button>
              <a
                href="#regions"
                className="inline-flex items-center gap-2 rounded-full bg-[#7fd6c0] px-4 py-2.5 text-xs font-semibold text-[#081217] transition hover:bg-[#9be6d3] sm:px-5 sm:text-sm"
              >
                <span className="hidden sm:inline">{copy.nav.openMap}</span>
                <span className="sm:hidden">Карта</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          <section id="hero" className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl items-center px-4 py-10 md:px-6 md:py-14 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#89dcca]/20 bg-[#89dcca]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9fead8]">
                <Sparkles className="h-4 w-4" />
                {copy.hero.badge}
              </div>

              <div className="space-y-4 md:space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {copy.hero.titleTop}
                  <span className="block text-[#8fdcc6]">{copy.hero.titleBottom}</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72 md:text-lg md:leading-8 lg:text-xl">
                  {copy.hero.text}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#regions"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#091118] transition hover:bg-[#dff8f1]"
                >
                  {copy.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsSignLanguageOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  <Volume2 className="h-4 w-4" />
                  {copy.hero.secondaryCta}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {copy.stats.map((item) => (
                  <div key={item.label} className="landing-panel rounded-[28px] p-5">
                    <div className="text-3xl font-semibold tracking-[-0.04em] text-white">{item.value}</div>
                    <div className="mt-2 text-sm leading-6 text-white/60">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section id="why" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
            <div className="mb-8 max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8fdcc6]">{copy.why.eyebrow}</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                {copy.why.title}
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/66">
                {copy.why.text}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {copy.why.cards.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="landing-panel rounded-[30px] p-7"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/7">
                      <Icon className="h-5 w-5 text-[#9fead8]" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-white/62">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section id="how" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
              <div className="landing-panel rounded-[34px] p-7 md:p-9">
                <div className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8fdcc6]">{copy.how.eyebrow}</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {copy.how.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-white/64">
                  {copy.how.text}
                </p>
              </div>

              <div className="grid gap-4">
                {copy.how.steps.map((item) => (
                  <div
                    key={item.step}
                    className="landing-panel flex flex-col gap-4 rounded-[30px] p-6 md:flex-row md:items-start md:justify-between md:p-7"
                  >
                    <div className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8fdcc6]">{item.step}</div>
                    <div className="md:max-w-[82%]">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white md:text-2xl">{item.title}</h3>
                      <p className="mt-2 text-base leading-7 text-white/62">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="regions" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8fdcc6]">{copy.regions.eyebrow}</div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                  {copy.regions.title}
                </h2>
                <p className="mt-4 text-lg leading-8 text-white/66">
                  {copy.regions.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRegionSelect?.('All')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8fdcc6]/28 bg-[#8fdcc6]/10 px-5 py-3 text-sm font-semibold text-[#a3ecda] transition hover:bg-[#8fdcc6]/16 sm:w-auto"
              >
                {copy.regions.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="landing-panel rounded-[38px] p-3 md:p-5">
              <RegionSelector onSelect={onRegionSelect ?? (() => undefined)} activeId="" />
            </div>
          </section>
        </main>

        {isLanguagePromptOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(3,8,12,0.72)] px-4 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="dialog-shell premium-noise relative w-full max-w-xl overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,rgba(12,22,28,0.96),rgba(8,14,20,0.94))] p-6 md:p-8"
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#8fdcc6]/14 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/6">
                  <Image
                    src="/assets/pani-dumka-avatar.png"
                    alt="Pani Dumka"
                    width={44}
                    height={44}
                    className="rounded-2xl"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcc6]">Пані Думка</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    {copy.languagePrompt.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-white/64">
                    {copy.languagePrompt.text}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                <button
                  type="button"
                  onClick={() => chooseLanguage('uk')}
                  className="flex items-center justify-between rounded-[24px] border border-[#8fdcc6]/22 bg-[#8fdcc6]/10 px-5 py-4 text-left transition hover:bg-[#8fdcc6]/16"
                >
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8fdcc6]">UA</div>
                    <div className="mt-1 text-lg font-medium text-white">{copy.languagePrompt.uk}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#8fdcc6]" />
                </button>

                <button
                  type="button"
                  onClick={() => chooseLanguage('en')}
                  className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/44">EN</div>
                    <div className="mt-1 text-lg font-medium text-white">{copy.languagePrompt.en}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/60" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <SignLanguageChatPanel isOpen={isSignLanguageOpen} onClose={() => setIsSignLanguageOpen(false)} />
        <PaniDumkaPremium
          isOpen={isPaniOpen}
          onOpen={() => setIsPaniOpen(true)}
          onClose={() => setIsPaniOpen(false)}
          autoGreet={false}
        />
        <BrandingFooter className="pb-8 pt-2" />
      </div>
    </div>
  );
}
