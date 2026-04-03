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
          badge: 'Inclusive Navigator for Social Support',
          titleTop: 'A clear entry point',
          titleBottom: 'to social services across Ukraine',
          text: 'No noise, no random blocks, no visual chaos. A person picks a region, opens the map, and reaches real support through a readable interface.',
          primaryCta: 'Start with region selection',
          secondaryCta: 'Sign language support',
        },
        stats: [
          { value: '6 200+', label: 'verified support locations' },
          { value: '25', label: 'regions in one interface' },
          { value: '24/7', label: 'access to critical services' },
        ],
        why: {
          eyebrow: 'Why It Works',
          title: 'Structure should guide a person, not get in the way',
          text: 'The landing page no longer feels like a mix of pitch deck, promo blocks, and accidental modals. It explains the product quickly and puts the main action in the center.',
          cards: [
            {
              title: 'Fast search',
              text: 'A person should open the map and find an address, contact, and type of support in under a minute.',
              icon: Sparkles,
            },
            {
              title: 'Inclusive interface',
              text: 'The page is built around accessibility: large blocks, strong contrast, clear hierarchy, and readable copy.',
              icon: HandHeart,
            },
            {
              title: 'Trust in the data',
              text: 'The platform shows only what helps orientation: region, service, organization, contact, and the next practical step.',
              icon: ShieldCheck,
            },
          ],
        },
        how: {
          eyebrow: 'How It Works',
          title: 'Action flow without overload',
          text: 'Each screen should move the person to the next step. No random promotional detours before someone reaches the service they actually need.',
          steps: [
            {
              step: '01',
              title: 'Pick a region',
              text: 'Start with all of Ukraine or go directly to your region.',
            },
            {
              step: '02',
              title: 'Narrow the request',
              text: 'On the map, the person can filter the category of support and the needed service.',
            },
            {
              step: '03',
              title: 'Contact the organization',
              text: 'The interface shows the address, contacts, and enough context without overwhelming the screen.',
            },
          ],
        },
        regions: {
          eyebrow: 'Regions',
          title: 'Pick a region and go straight to the map',
          text: 'The region selector is now part of the page instead of a narrow stack of cards floating on a dark overlay.',
          cta: 'Open all Ukraine',
        },
        languagePrompt: {
          title: 'Do you understand Ukrainian or English better?',
          text: 'I can switch the interface language right now so the map and explanations are easier to use.',
          uk: 'I understand Ukrainian',
          en: 'English is better for me',
          action: 'Change language',
        },
      };
    }

    return {
      nav: {
        why: 'Навіщо це',
        how: 'Як це працює',
        regions: 'Регіони',
        sign: 'Жестова підтримка',
        openMap: 'Відкрити карту',
        openLanguagePrompt: 'Мова',
      },
      hero: {
        badge: 'Інклюзивний навігатор соціальної допомоги',
        titleTop: 'Нормальна точка входу',
        titleBottom: 'до соціальних сервісів України',
        text: 'Без шуму, без випадкових блоків, без візуального хаосу. Людина швидко обирає регіон, переходить на карту і знаходить потрібну допомогу в зрозумілому інтерфейсі.',
        primaryCta: 'Почати з вибору регіону',
        secondaryCta: 'Підтримка жестовою мовою',
      },
      stats: [
        { value: '6 200+', label: 'перевірених точок допомоги' },
        { value: '25', label: 'регіонів у єдиному інтерфейсі' },
        { value: '24/7', label: 'доступ до критичних сервісів' },
      ],
      why: {
        eyebrow: 'Навіщо це',
        title: 'Структура має вести людину, а не заважати їй',
        text: 'Лендинг більше не виглядає як суміш презентації, pitch deck і випадкових модалок. Він пояснює продукт коротко, а головну дію ставить у центр.',
        cards: [
          {
            title: 'Швидкий пошук',
            text: 'Людина має відкрити карту й за хвилину знайти адресу, контакт і тип допомоги без зайвих кроків.',
            icon: Sparkles,
          },
          {
            title: 'Інклюзивний інтерфейс',
            text: 'Сторінка будується навколо доступності: великі блоки, чіткий контраст, нормальна ієрархія і читабельні тексти.',
            icon: HandHeart,
          },
          {
            title: 'Довіра до даних',
            text: 'Платформа показує лише те, що реально допомагає орієнтуватися: регіон, послугу, організацію, контакт і маршрут дії.',
            icon: ShieldCheck,
          },
        ],
      },
      how: {
        eyebrow: 'Як це працює',
        title: 'Маршрут дії без перевантаження',
        text: 'Кожен екран має працювати на наступну дію. Ніяких випадкових промо-блоків перед тим, як людина добереться до сервісу, який їй реально потрібен.',
        steps: [
          {
            step: '01',
            title: 'Оберіть регіон',
            text: 'Почніть з усієї України або одразу перейдіть до своєї області.',
          },
          {
            step: '02',
            title: 'Звузьте запит',
            text: 'На мапі можна відфільтрувати категорію допомоги й потрібний сервіс.',
          },
          {
            step: '03',
            title: 'Звʼяжіться з організацією',
            text: 'Користувач отримує адресу, контакти й короткий контекст без перевантаження екрану.',
          },
        ],
      },
      regions: {
        eyebrow: 'Регіони',
        title: 'Оберіть область і переходьте прямо на карту',
        text: 'Блок вибору регіону тепер є частиною сторінки, а не випадковим вертикальним стосом карток посеред затемненої підкладки.',
        cta: 'Відкрити всю Україну',
      },
      languagePrompt: {
        title: 'Ви краще розумієте українську чи англійську?',
        text: 'Я можу одразу переключити мову інтерфейсу, щоб картою і поясненнями було зручніше користуватися.',
        uk: 'Розумію українську',
        en: 'English is better for me',
        action: 'Змінити мову',
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
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8fdcc6]">Pani Dumka</div>
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
