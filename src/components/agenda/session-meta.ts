export const STATUS_LABELS: Record<string, string> = {
  livre: "Livre",
  pendente: "Pendente",
  confirmado: "Confirmado",
  finalizada: "Finalizada",
  reagendado: "Reagendado",
  cancelado_cobrado: "Cancelado (cobrado)",
  cancelado_sem_cobranca: "Cancelado (sem cobranca)",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  livre: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  pendente: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmado: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  finalizada: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  reagendado: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  cancelado_cobrado: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  cancelado_sem_cobranca: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const STATUS_DOT_CLASSES: Record<string, string> = {
  livre: "bg-slate-300",
  pendente: "bg-amber-400",
  confirmado: "bg-green-500",
  finalizada: "bg-purple-500",
  reagendado: "bg-blue-500",
  cancelado_cobrado: "bg-red-500",
  cancelado_sem_cobranca: "bg-slate-400",
};

export const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  online: "Online",
};

// "finalizada" is set automatically when a session note is saved,
// "reagendado" is set automatically by the reschedule flow (which also
// creates the linked new session), and the two "cancelado_*" statuses are
// set by the dedicated cancel flow (which requires a reason) — none of
// these should be picked directly from the generic status editor.
const SPECIAL_STATUSES = ["finalizada", "reagendado", "cancelado_cobrado", "cancelado_sem_cobranca"];

export const EDITABLE_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).filter(([value]) => !SPECIAL_STATUSES.includes(value))
);

export const CANCELLED_STATUSES = ["cancelado_cobrado", "cancelado_sem_cobranca"] as const;

export const REQUESTED_BY_LABELS: Record<string, string> = {
  paciente: "Paciente",
  profissional: "Profissional",
};
