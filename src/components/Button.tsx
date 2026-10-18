import type { ComponentProps } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'link'
  | 'quiet'
  | 'achievements';

const BASE_CLASS =
  'inline-flex min-h-touch items-center justify-center text-center disabled:opacity-55';

const VARIANT_CLASS: Readonly<Record<ButtonVariant, string>> = {
  primary:
    'min-h-13 w-full max-w-75 rounded-pill bg-accent px-5.5 py-3.75 text-[16px] text-on-accent',
  secondary:
    'min-h-12.5 w-full max-w-75 rounded-pill border-[1.5px] border-border-soft px-5.5 py-3.5 text-[15.5px] text-text-secondary',
  link: 'px-3 text-[14px] text-link hover:text-link-hover',
  quiet: 'px-3 text-[14.5px] text-text-secondary hover:text-text',
  achievements: 'px-3 text-[14.5px] text-achievements-fg',
};

/** @public Router links reuse the button look through this. */
export function buttonClass(variant: ButtonVariant): string {
  return `${BASE_CLASS} ${VARIANT_CLASS[variant]}`;
}

type Props = ComponentProps<'button'> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', className, ...props }: Props) {
  const variantClass = buttonClass(variant);
  return (
    <button
      type="button"
      {...props}
      className={className ? `${variantClass} ${className}` : variantClass}
    />
  );
}
