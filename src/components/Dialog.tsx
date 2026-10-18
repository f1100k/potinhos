import { type ReactNode, useEffect, useId, useRef } from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ open, title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(420px,calc(100vw-32px))] animate-[fadeUp_.5s_ease_both] rounded-card-xl border-[1.5px] border-border bg-surface px-6 py-7 text-center text-text shadow-card backdrop:bg-text/25"
    >
      <h2 id={titleId} className="mb-2.5 text-[22px] leading-[1.3] text-pretty">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
