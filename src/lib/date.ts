export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function isSameMonth(date: Date, reference: Date): boolean {
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

export function isSameDate(date: Date, reference: Date): boolean {
  return formatISODate(date) === formatISODate(reference);
}

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatDateLabel(date: Date): string {
  return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function extractDatePart(datetime: string): string {
  return datetime.split(" ")[0] ?? datetime;
}

export function extractTimePart(datetime: string): string {
  return (datetime.split(" ")[1] ?? "").slice(0, 5);
}

export function toMySQLDatetime(localDatetime: string): string {
  const [datePart, timePart] = localDatetime.split("T");
  const time = timePart ?? "00:00";
  return `${datePart} ${time}:00`;
}

export function toDatetimeLocalInput(datetime: string): string {
  const [datePart, timePart = ""] = datetime.split(" ");
  return `${datePart}T${timePart.slice(0, 5)}`;
}
