import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { JarIllustration } from '../../../components/jars/JarIllustration';
import { JAR_NAMES } from '../../../components/jars/jarNames';
import { buttonClass } from '../../../components/ui/Button';
import { useFlowNavigate } from '../../../features/jars/hooks/useFlow';
import { pickJar } from '../../../features/jars/utils/jarPick';
import {
  savedSlipsLabel,
  slipCountLabel,
} from '../../../features/jars/utils/slipLabels';
import { weekTurn } from '../../../features/jars/utils/weekTurn';
import { dispatch, useAppData } from '../../../stores/appData';
import { unlockFlow } from '../../../stores/session';
import { JARS, type Jar } from '../../../types/model';
import { longDateLabel } from '../../../utils/dateLabels';
import { slipCount } from '../../../utils/drawing';
import {
  isWeekComplete,
  isWeekEnding,
  isWeekOverdue,
  leftovers,
} from '../../../utils/week';

export const Route = createFileRoute('/_app/jars')({
  beforeLoad: () => {
    const now = new Date();
    switch (weekTurn(useAppData.getState(), now)) {
      case 'autoClose':
        dispatch({ type: 'closeWeek', decisions: {}, now, ids: [] });
        return;
      case 'askWeekend':
        unlockFlow();
        throw redirect({ to: '/jars/weekend', replace: true });
      case 'none':
        return;
    }
  },
  component: Home,
});

const ACHIEVEMENTS_SHORTCUT_SLIPS = 3;

function Home() {
  const data = useAppData();
  const flowNavigate = useFlowNavigate();
  const now = new Date();
  const weekComplete = isWeekComplete(data.tasks);
  const weekOverdue = isWeekOverdue(data.meta, now);
  const showWeekendCard =
    (weekOverdue || isWeekEnding(data.meta, now)) &&
    leftovers(data.tasks).length > 0;

  function openJar(jar: Jar) {
    const pickTime = new Date();
    const pick = pickJar(useAppData.getState(), jar, pickTime);
    switch (pick.kind) {
      case 'alreadyDrawn':
        flowNavigate({ to: '/jars/task' });
        return;
      case 'empty':
        flowNavigate({ to: '/jars/empty', search: { jar } });
        return;
      case 'draw':
        dispatch({ type: 'draw', taskId: pick.taskId, now: pickTime });
        flowNavigate({ to: '/jars/draw', search: { jar } });
        return;
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="pt-6 text-center">
        <div className="text-[13px] tracking-[.04em] text-text-secondary">
          {longDateLabel(now)}
        </div>
        <h1 className="mt-3 mb-2 text-[27px] leading-[1.25]">
          Como está sua energia hoje?
        </h1>
        <p className="text-[15px] text-pretty text-text-secondary">
          Escolha um pote do jeito que você está. Sem pressa.
        </p>
      </div>

      {showWeekendCard && (
        <div className="mx-auto mt-7 flex max-w-105 flex-wrap items-center gap-3.5 rounded-card-xl bg-weekly-bg px-4.5 py-4">
          <p className="min-w-45 flex-1 text-[14.5px] text-pretty text-weekly-fg">
            {weekOverdue
              ? 'A semana passada ficou aberta. Quer dar uma olhada no que ficou no pote Semanal?'
              : 'A semana está acabando. Quer dar uma olhada no que ficou no pote Semanal?'}
          </p>
          <button
            type="button"
            onClick={() => flowNavigate({ to: '/jars/weekend' })}
            className="min-h-touch rounded-pill bg-weekly-fg px-4.5 py-2.75 text-[14px] text-on-accent"
          >
            Fechar a semana
          </button>
        </div>
      )}

      <div className="mt-9 flex flex-wrap items-end justify-center gap-4">
        {JARS.map((jar) => {
          const count = slipCount(data.tasks, jar);
          const countLabel =
            jar === 'weekly' && weekComplete
              ? 'semana completa'
              : slipCountLabel(count);
          return (
            <button
              key={jar}
              type="button"
              aria-label={`Pote ${JAR_NAMES[jar]}, ${countLabel}`}
              onClick={() => openJar(jar)}
              className="flex w-24 flex-col items-center gap-2.5"
            >
              <JarIllustration
                kind={jar}
                size="sm"
                slips={count}
                weekTag={jar === 'weekly'}
              />
              <span className="text-[15px]">{JAR_NAMES[jar]}</span>
              <span className="-mt-1.5 text-[12.5px] text-text-secondary">
                {countLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6.5 text-center">
        <Link to="/edit" className={buttonClass('link')}>
          Ver e editar os potes
        </Link>
      </div>

      <Link
        to="/achievements"
        search={{ tab: 'week' }}
        className="mx-auto mt-8 flex w-full max-w-90 items-center gap-3.5 rounded-card-lg border border-achievements-border bg-achievements-bg py-3 pr-4.5 pl-3.5 text-left text-text hover:text-text"
      >
        <JarIllustration
          kind="achievements"
          size="xs"
          slips={Math.min(
            data.achievements.length,
            ACHIEVEMENTS_SHORTCUT_SLIPS,
          )}
        />
        <span className="flex-1">
          <span className="block text-[15px]">Suas conquistas</span>
          <span className="block text-[12.5px] text-achievements-fg">
            {savedSlipsLabel(data.achievements.length)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-[18px] text-achievements-accent"
        >
          ›
        </span>
      </Link>
    </div>
  );
}
