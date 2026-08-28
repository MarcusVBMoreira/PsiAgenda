<?php
// Pequenos helpers de UI reutilizados nas paginas.

declare(strict_types=1);

function backLink(string $href): void
{
    echo '<a href="' . h($href) . '" class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">';
    icon('chevron-left', 'h-4 w-4');
    echo 'Voltar</a>';
}

$__FREQUENCY_LABELS = ['semanal' => 'Semanal', 'quinzenal' => 'Quinzenal', 'mensal' => 'Mensal', 'outro' => 'Outro'];
$__PATIENT_STATUS_LABELS = ['ativo' => 'Ativo', 'inativo' => 'Inativo', 'encerrado' => 'Encerrado'];
$__PATIENT_STATUS_BADGE_CLASSES = [
    'ativo' => 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    'inativo' => 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'encerrado' => 'bg-slate-200 text-slate-500 dark:bg-slate-800/60 dark:text-slate-500',
];
