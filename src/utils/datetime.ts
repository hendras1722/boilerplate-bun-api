export function toSqliteDatetime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

type RelativeUnit = "menit" | "jam" | "hari" | "minggu" | "bulan";

const RELATIVE_OFFSETS: Record<RelativeUnit, (amount: number, from: Date) => Date> = {
  menit: (amount, from) => new Date(from.getTime() + amount * 60_000),
  jam: (amount, from) => new Date(from.getTime() + amount * 60 * 60_000),
  hari: (amount, from) => new Date(from.getTime() + amount * 24 * 60 * 60_000),
  minggu: (amount, from) => new Date(from.getTime() + amount * 7 * 24 * 60 * 60_000),
  bulan: (amount, from) => {
    const result = new Date(from);
    result.setUTCMonth(result.getUTCMonth() + amount);
    return result;
  },
};

const RELATIVE_PATTERN = /^(\d+)\s*(menit|jam|hari|minggu|bulan)(\s+lagi)?$/i;

/**
 * Accepts either an absolute ISO 8601 string or a relative string like
 * "1 jam", "30 menit", "2 hari", "1 minggu", "3 bulan" (optionally suffixed with "lagi").
 */
export function parseRemindAt(input: string, from: Date = new Date()): Date | null {
  const trimmed = input.trim();

  const relativeMatch = trimmed.match(RELATIVE_PATTERN);
  const [, amountText, unitText] = relativeMatch ?? [];
  if (amountText && unitText) {
    const unit = unitText.toLowerCase() as RelativeUnit;
    return RELATIVE_OFFSETS[unit](Number(amountText), from);
  }

  const absolute = new Date(trimmed);
  return Number.isNaN(absolute.getTime()) ? null : absolute;
}
