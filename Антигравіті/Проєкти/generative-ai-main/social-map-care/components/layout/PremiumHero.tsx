'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Headphones,
  Orbit,
  Sparkles,
  Stars,
  Waves,
} from 'lucide-react';
import { REMOTE_SUPPORT_ACTORS } from '@/data/constants';
import { useTimeTheme } from '@/components/theme/TimeThemeProvider';

interface PremiumHeroProps {
  onOpenMap: () => void;
  onBrowseRegions: () => void;
  onOpenIntelligence: () => void;
}

const impactStats = [
  { value: '25+', label: 'регіонів у фокусі' },
  { value: '24/7', label: 'гарячі сценарії' },
  { value: 'AI', label: 'signature host' },
];

export function PremiumHero({ onOpenMap, onBrowseRegions, onOpenIntelligence }: PremiumHeroProps) {
  const timeTheme = useTimeTheme();

  return (
    <div className="relative h-full premium-noise">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[7%] top-12 h-56 w-56 rounded-full bg-primary/[0.18] blur-[110px]" />
        <div className="absolute right-[10%] top-[14%] h-72 w-72 rounded-full bg-secondary/[0.16] blur-[120px]" />
        <div className="absolute bottom-[12%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/[0.12] blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute left-[6%] top-[10%] hidden xl:block"
      >
        <div className="floating-card-3d texture-lashes flex h-28 w-28 items-end rounded-[2rem] px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
          lash flow
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="pointer-events-none absolute bottom-[12%] right-[8%] hidden xl:block"
      >
        <div className="floating-card-3d texture-weave flex h-32 w-32 items-end rounded-[2.2rem] px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
          textile tone
        </div>
      </motion.div>

      <div className="relative z-10 grid min-h-full gap-6 p-6 md:p-8 xl:grid-cols-[1.14fr_0.86fr]">
        <section className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="bento-panel rounded-[2.6rem] p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-primary">
                <Stars size={14} />
                Соціальна Мапа Турботи
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold text-white/[0.72]">
                <Clock3 size={14} className="text-white/55" />
                {timeTheme.label}
              </span>
            </div>

            <div className="mt-7 max-w-4xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/45">
                Пані Думка — знаковий AI-хост системи
              </p>
              <h1 className="text-5xl font-black uppercase tracking-[-0.05em] text-white md:text-6xl xl:text-7xl">
                Соціальна мапа
                <span className="block bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
                  турботи нового рівня
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/[0.72] md:text-lg">
                Це не просто застосунок. Це інноваційна цифрова система координації підтримки, де карта, дистанційні маршрути, гарячі лінії та AI-супровід працюють як один преміальний центр прийняття рішень. {timeTheme.atmosphere}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bento-panel rounded-[1.8rem] p-5"
                >
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.2em] text-white/42">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row">
              <button
                type="button"
                onClick={onOpenMap}
                className="inline-flex items-center justify-center gap-3 rounded-[1.4rem] bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-slate-950 transition hover:scale-[1.01]"
              >
                Відкрити мапу турботи
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onBrowseRegions}
                className="inline-flex items-center justify-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
              >
                Дослідити регіони
              </button>

              <button
                type="button"
                onClick={onOpenIntelligence}
                className="inline-flex items-center justify-center gap-3 rounded-[1.4rem] border border-primary/20 bg-primary/[0.14] px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-primary transition hover:bg-primary/[0.18]"
              >
                AI-аналітика системи
              </button>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="bento-panel rounded-[2.2rem] p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10">
                  <Image src="/assets/pani-dumka-avatar.png" alt="Пані Думка" fill className="object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.12] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <Sparkles size={12} />
                    AI-серце проєкту
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-[-0.03em] text-white">Пані Думка</h2>
                  <p className="text-sm leading-7 text-white/70">
                    Оригінальний кінематографічний голос-провідник: теплий, спокійний, впевнений. Вона перетворює карту на досвід, а досвід — на конкретну дію.
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-panel rounded-[2.2rem] p-5">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Голосовий напрям</div>
                  <p className="mt-3 text-sm leading-7 text-white/[0.72]">
                    {timeTheme.greeting}. {timeTheme.supportTone}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    <Waves size={12} />
                    Присутність
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <motion.span
                        key={bar}
                        animate={{ height: ['26%', '100%', '34%'] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: bar * 0.16 }}
                        className="w-2 rounded-full bg-gradient-to-t from-primary/20 via-primary to-white/[0.80]"
                        style={{ height: 22 + bar * 8 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="bento-panel rounded-[2.4rem] p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">
                <Headphones size={18} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-white/45">Дистанційна підтримка</div>
                <h3 className="mt-1 text-xl font-black uppercase tracking-[-0.03em] text-white">Гарячі лінії та ескалація</h3>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {REMOTE_SUPPORT_ACTORS.slice(0, 3).map((actor) => (
                <div key={actor.id} className="bento-panel rounded-[1.6rem] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{actor.category}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{actor.name}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/[0.85]">
                      {actor.phones[0]}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/[0.65]">{actor.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <div className="bento-panel rounded-[2rem] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">
                  <Orbit size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Мова інтерфейсу</div>
                  <h4 className="mt-1 text-lg font-black uppercase tracking-[-0.03em] text-white">Скло глибоке + бенто</h4>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/[0.68]">
                Скломорфізм тут працює як архітектура інтерфейсу, а не як ефект: великі панелі, м&apos;які світлові поля, тактильні тіні та ритм системних блоків.
              </p>
            </div>

            <div className="bento-panel rounded-[2rem] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Floating accents</div>
              <p className="mt-3 text-sm leading-7 text-white/[0.68]">
                Плаваючі 3D-елементи з мотивами вій і текстур тканини задають fashion-tech характер та роблять систему впізнаваною для сильних презентацій і шотів.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
