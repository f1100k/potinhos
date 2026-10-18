import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { JarChip } from '../../../components/jars/JarChip';
import { JarIllustration } from '../../../components/jars/JarIllustration';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { useAppData } from '../../../stores/appData';
import { isoDateSchema } from '../../../types/model';
import {
  achievementsOfMonth,
  achievementsOfWeek,
} from '../../../utils/achievements';
import { shortDateLabel } from '../../../utils/dateLabels';
import { optionalParam } from '../../../utils/searchParams';
import { mondayOf } from '../../../utils/week';

const ACHIEVEMENT_TABS = ['week', 'month'] as const;
type AchievementTab = (typeof ACHIEVEMENT_TABS)[number];

export const Route = createFileRoute('/_app/achievements')({
  validateSearch: z.object({
    tab: z.enum(ACHIEVEMENT_TABS).catch('week'),
    week: optionalParam(isoDateSchema),
  }),
  component: Achievements,
});

const TAB_OPTIONS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
] as const;

const COPY: Readonly<Record<AchievementTab, { title: string; end: string }>> = {
  week: {
    title: 'Sua semana',
    end: 'Olha tudo que você fez essa semana, mesmo nos dias difíceis.',
  },
  month: {
    title: 'Seu mês',
    end: 'Olha tudo que você fez esse mês, mesmo nos dias difíceis.',
  },
};

// Long lists would take too long to unfold one by one.
const ANIMATED_ITEMS = 12;
const FIRST_DELAY_S = 0.3;
const STAGGER_S = 0.35;

function Achievements() {
  const { tab, week } = Route.useSearch();
  const navigate = Route.useNavigate();
  const achievements = useAppData((data) => data.achievements);
  const now = new Date();
  const shown =
    tab === 'week'
      ? achievementsOfWeek(achievements, week ?? mondayOf(now))
      : achievementsOfMonth(achievements, now);
  const animatedCount = Math.min(shown.length, ANIMATED_ITEMS);

  return (
    <div className="animate-fade-in pt-7">
      <h1 className="sr-only">Pote de conquistas</h1>
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/jars"
          className="inline-flex min-h-touch items-center text-[14.5px] text-text-secondary hover:text-text"
        >
          ‹ Potes
        </Link>
        <SegmentedControl
          label="Período"
          options={TAB_OPTIONS}
          value={tab}
          onChange={(next) => navigate({ search: { tab: next } })}
        />
      </div>

      <div className="mt-7 text-center">
        <div className="flex justify-center">
          <JarIllustration kind="achievements" size="sm" slips={0} />
        </div>
        <h2 className="mt-5.5 mb-1.5 text-[24px]">{COPY[tab].title}</h2>
        {shown.length > 0 && (
          <p className="text-[14.5px] text-text-secondary">
            Papeizinhos guardados, um a um.
          </p>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="mt-12.5 animate-[fadeUp_1s_ease_.3s_both] text-center text-[17px] text-pretty text-achievements-fg">
          Aqui vão morar as coisas que você fizer.
        </p>
      ) : (
        <>
          <ul className="mt-8.5 flex flex-col gap-3">
            {shown.map((achievement, index) => (
              <li
                key={achievement.id}
                style={{ transform: `rotate(${((index % 3) - 1) * 0.6}deg)` }}
              >
                <div
                  className="flex origin-top items-center justify-between gap-3.5 rounded-sm border-[1.5px] border-achievements-card-border bg-surface px-4.5 py-4"
                  style={{
                    animation:
                      index < ANIMATED_ITEMS
                        ? `unfoldIn 1s cubic-bezier(.4,0,.2,1) ${FIRST_DELAY_S + index * STAGGER_S}s both`
                        : undefined,
                  }}
                >
                  <div className="min-w-0 flex-1 text-[16px]">
                    {achievement.text}
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.25">
                    <JarChip jar={achievement.jar} />
                    <div className="text-[12px] text-text-secondary">
                      {shortDateLabel(achievement.date)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p
            className="mx-auto mt-10 max-w-80 text-center text-[16px] text-pretty text-achievements-fg"
            style={{
              animation: `fadeUp 1s ease ${0.6 + animatedCount * STAGGER_S}s both`,
            }}
          >
            {COPY[tab].end}
          </p>
        </>
      )}
    </div>
  );
}
