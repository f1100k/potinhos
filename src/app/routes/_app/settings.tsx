import { createFileRoute, Link } from '@tanstack/react-router';
import { type ChangeEvent, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { toast } from '../../../components/ui/Toast';
import { downloadText } from '../../../features/settings/utils/files';
import { readImportFile } from '../../../features/settings/utils/importFile';
import { mergeData } from '../../../features/settings/utils/merge';
import { dispatch, useAppData } from '../../../stores/appData';
import { exportFile, exportFileName } from '../../../stores/persistence/schema';
import { browserStorage, clearData } from '../../../stores/persistence/storage';
import type { AppData } from '../../../types/model';

export const Route = createFileRoute('/_app/settings')({
  component: Settings,
});

const CARD_CLASS = 'rounded-card-md border-[1.5px] border-border bg-surface';

const SECTION_TITLE_CLASS =
  'mt-9 text-[13px] tracking-[.04em] text-text-secondary';

const DATA_ACTION_CLASS = 'min-h-10 px-2.5 text-[13.5px] first:pl-0';

const SOUND_MOMENTS = [
  [
    'Sorteio',
    'leve farfalhar quando o papelzinho sai do pote, depois o som suave de papel se desdobrando.',
  ],
  [
    'Conclusão',
    'papel se dobrando, terminando com um "toc" delicado ao cair no pote de conquistas.',
  ],
  [
    'Não consegui hoje',
    'só o farfalhar leve de volta ao pote. Nenhum som de erro.',
  ],
  ['Nova semana', 'papeizinhos caindo no pote, um a um, bem baixinho.'],
] as const;

function countLabel(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`;
}

function hasAnything(data: AppData): boolean {
  return data.tasks.length > 0 || data.achievements.length > 0;
}

function Settings() {
  const sounds = useAppData((data) => data.settings.sounds);
  const navigate = Route.useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toImport, setToImport] = useState<AppData | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function download() {
    const now = new Date();
    downloadText(exportFileName(now), exportFile(useAppData.getState(), now));
    toast('Seus papeizinhos foram baixados em um arquivo.');
  }

  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const result = await readImportFile(file, new Date());
    if (result.kind === 'error') {
      toast(result.message);
      return;
    }
    if (hasAnything(useAppData.getState())) {
      setToImport(result.data);
    } else {
      replaceWith(result.data);
    }
  }

  function replaceWith(data: AppData) {
    dispatch({ type: 'replace', data });
    setToImport(null);
    toast('Pronto, seus papeizinhos chegaram.');
  }

  function mergeWith(data: AppData) {
    dispatch({ type: 'replace', data: mergeData(useAppData.getState(), data) });
    setToImport(null);
    toast('Pronto, juntei os papeizinhos.');
  }

  function deleteEverything() {
    clearData(browserStorage());
    dispatch({ type: 'reset', now: new Date() });
    setConfirmingDelete(false);
    toast('Tudo limpinho. Quando quiser, é só começar de novo.');
    navigate({ to: '/jars' });
  }

  return (
    <div className="mx-auto max-w-130 animate-fade-in pt-7">
      <h1 className="mb-5.5 text-[24px]">Configurações</h1>

      <button
        type="button"
        role="switch"
        aria-checked={sounds}
        onClick={() => dispatch({ type: 'setSounds', on: !sounds })}
        className={`flex min-h-14 w-full items-center justify-between gap-3.5 px-4.5 py-4 text-left ${CARD_CLASS}`}
      >
        <span>
          <span className="block text-[16px]">Sons de papel</span>
          <span className="mt-0.5 block text-[12.5px] text-text-secondary">
            Respeitam o modo silencioso do celular
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`relative h-7 w-12 flex-none rounded-pill transition-colors duration-400 ${sounds ? 'bg-accent' : 'bg-border'}`}
        >
          <span
            className={`absolute top-0.75 size-5.5 rounded-full bg-surface shadow-[0_1px_3px_rgb(0_0_0/15%)] transition-[left] duration-400 ${sounds ? 'left-5.75' : 'left-0.75'}`}
          />
        </span>
      </button>

      <h2 className={SECTION_TITLE_CLASS}>Seus papeizinhos</h2>
      <div className={`mt-3 px-4.5 py-4 ${CARD_CLASS}`}>
        <div className="text-[16px]">Guardados só neste aparelho</div>
        <p className="mt-0.5 text-[12.5px] text-pretty text-text-secondary">
          Sem conta, sem cadastro. Nada sai daqui. Se quiser levar para outro
          aparelho, baixe um arquivo e importe lá.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={download}
            className={`${DATA_ACTION_CLASS} text-link`}
          >
            Baixar meus dados
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${DATA_ACTION_CLASS} text-link`}
          >
            Importar arquivo
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className={`${DATA_ACTION_CLASS} text-text-secondary`}
          >
            Apagar tudo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          aria-label="Arquivo para importar"
          onChange={pickFile}
          className="hidden"
        />
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        <Link
          to="/"
          className={`flex min-h-13 items-center justify-between gap-3.5 px-4.5 py-3.5 text-text hover:text-text ${CARD_CLASS}`}
        >
          <span className="text-[16px]">Sobre o Potinhos</span>
          <span aria-hidden="true" className="text-[18px] text-text-tertiary">
            ›
          </span>
        </Link>
        <Link
          to="/coffee"
          search={{ from: 'app' }}
          className="flex min-h-13 items-center justify-between gap-3.5 rounded-card-md border border-achievements-border bg-achievements-bg px-4.5 py-3.5 text-text hover:text-text"
        >
          <span>
            <span className="block text-[16px]">Me paga um café?</span>
            <span className="mt-0.5 block text-[12.5px] text-achievements-fg">
              Gratuito e sem anúncios, sempre
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

      <h2 className={SECTION_TITLE_CLASS}>Quando cada som toca</h2>
      <ul className="mt-3 flex flex-col gap-2 text-[14px] text-text-muted">
        {SOUND_MOMENTS.map(([moment, description]) => (
          <li key={moment} className="flex gap-2.5">
            <span aria-hidden="true" className="flex-none text-link">
              ♪
            </span>
            <span>
              <span className="text-text">{moment}:</span> {description}
            </span>
          </li>
        ))}
      </ul>

      <Dialog
        open={toImport !== null}
        title="Como quer importar?"
        onClose={() => setToImport(null)}
      >
        {toImport && (
          <>
            <p className="text-[15px] text-pretty text-text-secondary">
              O arquivo tem{' '}
              {countLabel(toImport.tasks.length, 'papelzinho', 'papeizinhos')} e{' '}
              {countLabel(
                toImport.achievements.length,
                'conquista',
                'conquistas',
              )}
              . Quer juntar com o que já está aqui ou trocar tudo?
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button onClick={() => mergeWith(toImport)}>
                Juntar com os daqui
              </Button>
              <Button variant="secondary" onClick={() => replaceWith(toImport)}>
                Trocar tudo pelo arquivo
              </Button>
              <Button variant="quiet" onClick={() => setToImport(null)}>
                Melhor não
              </Button>
            </div>
          </>
        )}
      </Dialog>

      <Dialog
        open={confirmingDelete}
        title="Apagar tudo mesmo?"
        onClose={() => setConfirmingDelete(false)}
      >
        <p className="text-[15px] text-pretty text-text-secondary">
          Seus potes, pendentes e conquistas vão sumir deste aparelho, e não dá
          para desfazer. Se quiser guardar uma cópia, baixe seus dados antes.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button onClick={download}>Baixar meus dados</Button>
          <Button variant="secondary" onClick={deleteEverything}>
            Apagar tudo
          </Button>
          <Button variant="quiet" onClick={() => setConfirmingDelete(false)}>
            Melhor não
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
