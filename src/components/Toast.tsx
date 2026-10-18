import { toast as sonner } from 'sonner';

export const TOAST_MS = 2600;

const PILL =
  'flex max-w-full items-center gap-3 rounded-pill border-[1.5px] border-border bg-surface px-4.5 py-3 text-center text-[14px] text-text shadow-toast wide:whitespace-nowrap';

type ToastAction = { label: string; onClick: () => void };

export function toast(text: string, action?: ToastAction): void {
  sonner.dismiss();
  sonner.custom(
    (id) => (
      <div className={PILL}>
        {text}
        {action && (
          <button
            type="button"
            className="font-bold underline underline-offset-2"
            onClick={() => {
              action.onClick();
              sonner.dismiss(id);
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    ),
    { duration: TOAST_MS },
  );
}
