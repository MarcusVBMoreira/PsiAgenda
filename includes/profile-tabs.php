<?php
declare(strict_types=1);

const PROFILE_TABS = [
    'dados-gerais' => 'Dados gerais',
    'historico-medico' => 'Historico medico',
    'sessoes' => 'Linha do tempo de sessoes',
    'documentos' => 'Documentos',
];

function renderProfileTabs(string $patientId, string $active): void
{
    echo '<div class="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800">';
    foreach (PROFILE_TABS as $key => $label) {
        $isActive = $active === $key;
        $cls = $isActive
            ? 'border-slate-800 text-slate-900 dark:border-slate-100 dark:text-slate-50'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200';
        echo '<a href="' . h(APP_URL) . '/pacientes/' . h($patientId) . '/visualizar?tab=' . h($key) . '" class="-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ' . $cls . '">' . h($label) . '</a>';
    }
    echo '</div>';
}

function infoField(string $label, ?string $value, bool $fullWidth = false): void
{
    $wrapClass = $fullWidth ? ' class="sm:col-span-2"' : '';
    echo '<div' . $wrapClass . '><p class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">' . h($label) . '</p>'
        . '<p class="mt-0.5 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">' . h($value !== null && $value !== '' ? $value : '—') . '</p></div>';
}
