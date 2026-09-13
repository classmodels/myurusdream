export const EURO = "€";

export function formatCents(cents: number, locale = "nl-BE"): string {
  const euros = (cents / 100).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${EURO}${euros}`;
}

export function formatCentsExact(cents: number, locale = "nl-BE"): string {
  const euros = (cents / 100).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${EURO}${euros}`;
}

export function percentReached(raisedCents: number, goalCents: number): number {
  if (goalCents <= 0) return 0;
  return Math.min(100, (raisedCents / goalCents) * 100);
}
