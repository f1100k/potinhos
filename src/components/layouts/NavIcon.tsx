const PATHS = {
  jars: (
    <>
      <rect x="8" y="3" width="8" height="3" rx="1.2" />
      <path d="M9 6v1.5C6.5 8.7 5 11 5 14c0 4 2.7 7 7 7s7-3 7-7c0-3-1.5-5.3-4-6.5V6" />
    </>
  ),
  newTask: <path d="M12 5v14M5 12h14" />,
  pending: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
};

type Props = {
  name: keyof typeof PATHS;
};

export function NavIcon({ name }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5.5"
    >
      {PATHS[name]}
    </svg>
  );
}
