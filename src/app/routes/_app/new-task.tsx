import { createFileRoute } from '@tanstack/react-router';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { JAR_NAMES } from '../../../components/jars/jarNames';
import { Button } from '../../../components/ui/Button';
import { FreqStepper } from '../../../components/ui/FreqStepper';
import { toast } from '../../../components/ui/Toast';
import { dispatch, newId } from '../../../stores/appData';
import { JARS, type Jar } from '../../../types/model';
import { jarSearch } from '../../../utils/searchParams';
import { NEW_TASK_FREQ } from '../../../utils/tasks';

export const Route = createFileRoute('/_app/new-task')({
  validateSearch: jarSearch,
  component: NewTask,
});

const JAR_CHOICE_CLASS: Readonly<Record<Jar, string>> = {
  simple:
    'aria-pressed:border-lid-simple aria-pressed:bg-chip-simple-bg aria-pressed:text-chip-simple-fg',
  complex:
    'aria-pressed:border-lid-simple aria-pressed:bg-chip-simple-bg aria-pressed:text-chip-simple-fg',
  weekly:
    'aria-pressed:border-lid-weekly aria-pressed:bg-weekly-bg aria-pressed:text-weekly-fg',
};

function NewTask() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [text, setText] = useState('');
  const [jar, setJar] = useState<Jar>(search.jar ?? 'simple');
  const [freq, setFreq] = useState(NEW_TASK_FREQ);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => inputRef.current?.focus(), []);

  function save(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      toast('Escreva a tarefa primeiro, sem pressa.');
      inputRef.current?.focus();
      return;
    }
    dispatch(
      jar === 'weekly'
        ? { type: 'addTask', id: newId(), text: trimmed, jar, freq }
        : { type: 'addTask', id: newId(), text: trimmed, jar },
    );
    toast(`Papelzinho guardado no pote ${JAR_NAMES[jar]}.`);
    navigate({ to: '/jars' });
  }

  return (
    <form
      onSubmit={save}
      className="mx-auto max-w-110 animate-fade-in pt-9"
      noValidate
    >
      <h1 id={titleId} className="mb-6 text-[24px]">
        O que você quer guardar?
      </h1>
      <input
        ref={inputRef}
        aria-labelledby={titleId}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escreva a tarefa"
        enterKeyHint="done"
        className="min-h-13.5 w-full rounded-card border-[1.5px] border-border bg-surface px-4.5 py-4 text-[17px] text-text placeholder:text-text-tertiary"
      />
      <fieldset className="mt-7">
        <legend className="mb-3 text-[13px] text-text-secondary">
          Em qual pote?
        </legend>
        <div className="flex gap-2.5">
          {JARS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={jar === option}
              onClick={() => setJar(option)}
              className={`min-h-13 flex-1 rounded-card border-[1.5px] border-border bg-surface px-2 py-3.5 text-[14.5px] text-text-secondary ${JAR_CHOICE_CLASS[option]}`}
            >
              {JAR_NAMES[option]}
            </button>
          ))}
        </div>
      </fieldset>
      {jar === 'weekly' && (
        <div className="mt-6 flex animate-[fadeIn_.5s_ease_both] items-center justify-between gap-3 rounded-card-md bg-weekly-bg px-4.5 py-4">
          <div className="text-[14.5px] text-weekly-fg">
            Quantas vezes por semana?
          </div>
          <FreqStepper
            freq={freq}
            onChange={setFreq}
            size="md"
            formatFreq={(times) => `${times}x`}
          />
        </div>
      )}
      <Button type="submit" className="mt-9 max-w-none!">
        Colocar no pote
      </Button>
    </form>
  );
}
