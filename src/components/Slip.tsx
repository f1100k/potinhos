import type { Jar } from '../domain/types';
import { JarChip } from './JarChip';

type Props = { className?: string } & (
  | { variant: 'folded' }
  | { variant: 'unfolded'; text: string }
  | { variant: 'card'; text: string; jar: Jar }
);

const PAPER_CLASS = 'border-[1.5px] border-border bg-surface';

export function Slip(props: Props) {
  const extraClass = props.className ?? '';

  switch (props.variant) {
    case 'folded':
      return (
        <div
          aria-hidden="true"
          className={`relative h-8 w-19 rounded-[5px] shadow-paper ${PAPER_CLASS} ${extraClass}`}
        >
          <div className="absolute inset-x-0 top-1/2 h-px bg-border-soft" />
        </div>
      );
    case 'unfolded':
      return (
        <div
          className={`w-68 rounded-card px-6 py-6.5 shadow-card ${PAPER_CLASS} ${extraClass}`}
        >
          <div className="text-[21px] leading-[1.35] text-pretty">
            {props.text}
          </div>
        </div>
      );
    case 'card':
      return (
        <div
          className={`w-full max-w-85 rounded-card-md px-7 py-8.5 text-center shadow-card ${PAPER_CLASS} ${extraClass}`}
        >
          <div className="text-[23px] leading-[1.35] text-pretty">
            {props.text}
          </div>
          <div className="mt-4.5">
            <JarChip jar={props.jar} />
          </div>
        </div>
      );
  }
}
