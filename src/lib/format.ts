// Digits-only phone with Brazil's country code, for APIs that expect E.164-style
// numbers without symbols (e.g. WhatsApp Cloud API's "to" field). Assumes any
// 10-11 digit number without a country code is Brazilian (DDD + number).
export function toWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.startsWith("55") && digits.length > 11) return digits;
  return `55${digits}`;
}

export function formatBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
