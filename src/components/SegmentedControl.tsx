import { type KeyboardEvent, useRef } from 'react';

type SegmentOption<Value extends string> = {
  value: Value;
  label: string;
};

type Props<Value extends string> = {
  label: string;
  options: readonly SegmentOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
};

const STEP_BY_KEY: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: Props<Value>) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const step = STEP_BY_KEY[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const nextIndex = (index + step + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onChange(next.value);
    tabsRef.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex rounded-pill bg-segment p-0.75"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              tabsRef.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="relative min-h-9 rounded-pill px-3.5 py-2 text-[13.5px] text-text-secondary before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] aria-selected:bg-surface aria-selected:text-text"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
