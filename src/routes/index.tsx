import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { requestPersistentStorage } from '../app/persistentStorage';
import { dispatch, useAppData } from '../app/store';
import { JarIllustration } from '../components/JarIllustration';
import { toast } from '../components/Toast';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.appOpening && useAppData.getState().meta.visited) {
      throw redirect({ to: '/jars', replace: true });
    }
  },
  component: Landing,
});

const STEPS: readonly { title: string; text: ReactNode }[] = [
  {
    title: 'Você escreve suas tarefas em papeizinhos',
    text: (
      <>
        E guarda cada um em um pote: <span className="text-text">Simples</span>,{' '}
        <span className="text-text">Complexas</span> ou{' '}
        <span className="text-text">Semanal</span>, para o que precisa acontecer
        algumas vezes por semana.
      </>
    ),
  },
  {
    title: 'Cada dia, você escolhe o pote pela sua energia',
    text: 'Dia difícil? Pote Simples. Dia bom? Pote Complexas. O app sorteia um papelzinho e você só se compromete a tentar.',
  },
  {
    title: 'O que você conclui vai para o pote de conquistas',
    text: 'Para abrir quando quiser e ver tudo o que fez. Sem pontos, sem ranking, sem sequência de dias, sem culpa.',
  },
];

const PROMISES = [
  [
    'Não consegui hoje? Tudo bem.',
    'O papelzinho volta para o pote, muda de pote ou fica pendente. Amanhã é outro dia.',
  ],
  [
    'Nada sai do seu aparelho.',
    'Sem conta, sem cadastro, sem e-mail. Seus papeizinhos ficam guardados só no seu celular ou computador. Nada de anúncios ou rastreamento.',
  ],
  [
    'Baseado em psicologia.',
    'Dividir tarefas por complexidade e ajustar a exigência à energia do dia valoriza o esforço em vez de gerar cobrança.',
  ],
] as const;

const SECTION_CLASS = 'mx-auto max-w-260 px-6';

function Landing() {
  const visited = useAppData((data) => data.meta.visited);
  const navigate = Route.useNavigate();
  const ctaLabel = visited ? 'Abrir meus potes' : 'Começar';

  function start() {
    if (!visited) {
      dispatch({ type: 'visit' });
      toast('Seus papeizinhos ficam só neste aparelho.');
      void requestPersistentStorage();
    }
    navigate({ to: '/jars' });
  }

  return (
    <div className="min-w-0 animate-fade-in">
      <header
        className={`${SECTION_CLASS} flex items-center justify-between gap-4 py-5.5`}
      >
        <div className="text-[22px] text-link">Potinhos</div>
        <button
          type="button"
          onClick={start}
          className="min-h-touch rounded-pill bg-accent px-5 py-2.75 text-[14.5px] text-on-accent"
        >
          {ctaLabel}
        </button>
      </header>

      <section
        className={`${SECTION_CLASS} grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-10 pt-10 pb-5`}
      >
        <div>
          <h1 className="mb-4.5 text-[clamp(34px,5vw,52px)] leading-[1.12] text-pretty">
            Um jeito gentil de fazer as coisas, um papelzinho de cada vez.
          </h1>
          <p className="max-w-130 text-[18px] leading-[1.55] text-pretty text-text-secondary">
            Para quem vive ciclos de procrastinação. Você escolhe o pote pela
            energia do dia, o app sorteia uma tarefa, e tentar já conta. Sem
            pontos, sem ranking, sem culpa.
          </p>
          <p className="mt-8 text-[14px] text-text-tertiary">
            Gratuito. Sem anúncios.
          </p>
        </div>
        <div className="flex items-end justify-center gap-5.5 py-7.5">
          <JarIllustration kind="simple" size="sm" slips={3} />
          <JarIllustration kind="complex" size="md" slips={2} />
          <JarIllustration kind="weekly" size="sm" slips={2} weekTag />
        </div>
      </section>

      <section className={`${SECTION_CLASS} py-10`}>
        <h2 className="mb-5 text-[14px] tracking-[.06em] text-text-secondary uppercase">
          Como funciona
        </h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-card-xl border-[1.5px] border-border bg-surface px-5.5 py-6"
            >
              <div
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-chip-simple-bg text-[15px] text-chip-simple-fg"
              >
                {index + 1}
              </div>
              <h3 className="mt-4.5 text-[19px] leading-[1.3]">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-pretty text-text-secondary">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`${SECTION_CLASS} grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 pt-5 pb-10`}
      >
        {PROMISES.map(([title, text]) => (
          <div key={title} className="px-1 py-2">
            <h3 className="text-[17px]">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-[1.5] text-pretty text-text-secondary">
              {text}
            </p>
          </div>
        ))}
      </section>

      <section className="px-6 pt-10 pb-15 text-center">
        <p className="mb-5.5 text-[24px] text-pretty">
          Um passinho de cada vez.
        </p>
        <button
          type="button"
          onClick={start}
          className="min-h-13.5 rounded-pill bg-accent px-7 py-4 text-[17px] text-on-accent"
        >
          {ctaLabel}
        </button>
      </section>

      <footer
        className={`${SECTION_CLASS} flex flex-wrap justify-between gap-3 border-t border-divider pt-5 pb-9 text-[13.5px] text-text-tertiary`}
      >
        <span>Potinhos. Gratuito, sem anúncios, para sempre.</span>
        <Link to="/coffee" search={{ from: 'landing' }} className="text-link">
          Me paga um café?
        </Link>
      </footer>
    </div>
  );
}
