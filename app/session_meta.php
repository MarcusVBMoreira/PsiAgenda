<?php
// Labels/classes de status de sessao, portado de src/components/agenda/session-meta.ts.

declare(strict_types=1);

const STATUS_LABELS = [
    'livre' => 'Livre', 'pendente' => 'Pendente', 'confirmado' => 'Confirmado',
    'finalizada' => 'Finalizada', 'reagendado' => 'Reagendado',
    'cancelado_cobrado' => 'Cancelado (cobrado)', 'cancelado_sem_cobranca' => 'Cancelado (sem cobranca)',
];

const STATUS_BADGE_CLASSES = [
    'livre' => 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    'pendente' => 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    'confirmado' => 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    'finalizada' => 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'reagendado' => 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'cancelado_cobrado' => 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'cancelado_sem_cobranca' => 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
];

const STATUS_DOT_CLASSES = [
    'livre' => 'bg-slate-300', 'pendente' => 'bg-amber-400', 'confirmado' => 'bg-green-500',
    'finalizada' => 'bg-purple-500', 'reagendado' => 'bg-blue-500',
    'cancelado_cobrado' => 'bg-red-500', 'cancelado_sem_cobranca' => 'bg-slate-400',
];

const MODALITY_LABELS = ['presencial' => 'Presencial', 'online' => 'Online'];

// "finalizada" e setado automaticamente ao salvar um registro de sessao,
// "reagendado" pelo fluxo de reagendamento, e os dois "cancelado_*" pelo
// fluxo de cancelamento (que exige motivo) — nenhum desses e escolhido
// diretamente no seletor generico de status.
const SPECIAL_STATUSES = ['finalizada', 'reagendado', 'cancelado_cobrado', 'cancelado_sem_cobranca'];

const EDITABLE_STATUS_LABELS = [
    'livre' => 'Livre', 'pendente' => 'Pendente', 'confirmado' => 'Confirmado',
];

const CANCELLED_STATUSES = ['cancelado_cobrado', 'cancelado_sem_cobranca'];

const REQUESTED_BY_LABELS = ['paciente' => 'Paciente', 'profissional' => 'Profissional'];
