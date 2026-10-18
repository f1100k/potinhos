const LONG_DATE = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function longDateLabel(date: Date): string {
  const label = LONG_DATE.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
