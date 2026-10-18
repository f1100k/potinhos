import { MAX_FREQ, MIN_FREQ } from '../domain/tasks';

type StepperSize = 'md' | 'sm';

const STEP_CLASS: Readonly<Record<StepperSize, string>> = {
  md: 'size-11 text-[20px]',
  sm: 'size-9 text-[17px]',
};

const VALUE_CLASS: Readonly<Record<StepperSize, string>> = {
  md: 'min-w-7 text-[18px]',
  sm: 'min-w-24 text-[13.5px]',
};

type Props = {
  freq: number;
  onChange: (freq: number) => void;
  size: StepperSize;
  formatFreq: (freq: number) => string;
};

export function FreqStepper({ freq, onChange, size, formatFreq }: Props) {
  const stepClass = `flex flex-none items-center justify-center rounded-full border-[1.5px] border-weekly-border bg-surface text-weekly-fg disabled:opacity-40 ${STEP_CLASS[size]}`;

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        aria-label="Uma vez a menos por semana"
        disabled={freq <= MIN_FREQ}
        onClick={() => onChange(freq - 1)}
        className={stepClass}
      >
        −
      </button>
      <div
        aria-live="polite"
        className={`text-center text-weekly-fg ${VALUE_CLASS[size]}`}
      >
        {formatFreq(freq)}
      </div>
      <button
        type="button"
        aria-label="Uma vez a mais por semana"
        disabled={freq >= MAX_FREQ}
        onClick={() => onChange(freq + 1)}
        className={stepClass}
      >
        +
      </button>
    </div>
  );
}
