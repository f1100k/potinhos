import { createFileRoute } from '@tanstack/react-router';
import { buttonClass } from '../../../components/ui/Button';
import { QrCode } from '../../../components/ui/QrCode';
import { toast } from '../../../components/ui/Toast';
import {
  BUY_ME_A_COFFEE_URL,
  PIX_KEY,
  PIX_KEY_LABEL,
  PIX_RECIPIENT,
} from '../../../config/support';
import { pixCode } from '../../../features/coffee/utils/pixCode';

const PIX_CODE = pixCode(PIX_RECIPIENT);

export const Route = createFileRoute('/_app/coffee')({
  component: Coffee,
});

const COPY_CLASS =
  'min-h-touch rounded-pill border-[1.5px] border-border-soft bg-surface-muted px-4 py-2.5 text-[14px] text-text';

const STEAM = [
  { left: 16, animation: 'sway 3s ease-in-out infinite' },
  { left: 30, animation: 'sway 3.6s ease-in-out .5s infinite' },
  { left: 44, animation: 'sway 3.2s ease-in-out 1s infinite' },
];

async function copy(text: string, thanks: string, fallback: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(thanks);
  } catch {
    toast(fallback);
  }
}

function Coffee() {
  return (
    <div className="mx-auto max-w-110 animate-fade-in pt-9 text-center">
      <CoffeeCup />
      <h1 className="mt-7 mb-2.5 text-[26px] leading-[1.25]">
        Me paga um café?
      </h1>
      <p className="text-[15px] leading-[1.55] text-pretty text-text-secondary">
        O Potinhos é gratuito e vai continuar assim. Não tem anúncio, não tem
        plano pago, não tem venda de dados. Se ele te ajudou em algum dia
        difícil e você quiser retribuir, um café já deixa a gente feliz.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3.5 rounded-card-lg border-[1.5px] border-border bg-surface px-5 py-5.5">
        <QrCode value={PIX_CODE} label="QR code do Pix" size={150} />
        <div className="text-[14px] text-text-secondary">Chave Pix (CPF)</div>
        <button
          type="button"
          onClick={() =>
            copy(
              PIX_KEY,
              'Chave Pix copiada. Obrigada!',
              `Não consegui copiar. A chave é ${PIX_KEY_LABEL}.`,
            )
          }
          className={`${COPY_CLASS} font-mono`}
        >
          {PIX_KEY_LABEL} · copiar
        </button>
        <button
          type="button"
          onClick={() =>
            copy(
              PIX_CODE,
              'Pix copia e cola copiado. Obrigada!',
              'Não consegui copiar. Use a chave ou o QR code.',
            )
          }
          className="min-h-touch px-3 text-[14px] text-link hover:text-link-hover"
        >
          Copiar Pix copia e cola
        </button>
      </div>

      {BUY_ME_A_COFFEE_URL && (
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass('primary')} mt-3.5 hover:text-on-accent`}
        >
          Apoiar no Buy Me a Coffee
        </a>
      )}
      <p className="mt-6 text-[13px] text-pretty text-text-tertiary">
        Sem valor sugerido, sem meta. Qualquer coisa é um presente.
      </p>
    </div>
  );
}

function CoffeeCup() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-17.5 w-21">
      <div className="absolute top-3.5 left-0 h-14 w-15.5 rounded-[6px_6px_26px_26px] border-2 border-border bg-surface" />
      <div className="absolute top-6 left-14.5 h-6.5 w-5.5 rounded-[0_14px_14px_0] border-2 border-l-0 border-border" />
      {STEAM.map((steam) => (
        <div
          key={steam.left}
          className="absolute top-0 h-3 w-0.75 rounded-[2px] bg-border"
          style={{ left: steam.left, animation: steam.animation }}
        />
      ))}
    </div>
  );
}
