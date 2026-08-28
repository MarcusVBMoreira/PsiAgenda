<?php
// Helpers de formulario reutilizados em varias telas.

declare(strict_types=1);

/** Campo de senha com botao de mostrar/ocultar (olho), autoativado por assets/js/password-toggle.js. */
function passwordField(string $id, string $label, array $attrs = []): void
{
    $attrString = '';
    foreach ($attrs as $k => $v) {
        $attrString .= ' ' . h($k) . '="' . h((string) $v) . '"';
    }
    echo '<div><label for="' . h($id) . '" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">' . h($label) . '</label>'
        . '<div class="relative">'
        . '<input type="password" id="' . h($id) . '" name="' . h($id) . '"' . $attrString
        . ' class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">'
        . '<button type="button" class="password-toggle-btn absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" data-target="' . h($id) . '" title="Mostrar senha" aria-label="Mostrar senha">';
    icon('eye', 'h-4 w-4 password-toggle-icon-show');
    icon('eye-off', 'h-4 w-4 password-toggle-icon-hide hidden');
    echo '</button></div></div>';
}

/** Variante sem label visivel (so placeholder) — usada em formularios compactos como Trocar Senha. */
function passwordFieldPlain(string $id, string $placeholder, array $attrs = []): void
{
    $attrString = '';
    foreach ($attrs as $k => $v) {
        $attrString .= ' ' . h($k) . '="' . h((string) $v) . '"';
    }
    echo '<div class="relative">'
        . '<input type="password" id="' . h($id) . '" placeholder="' . h($placeholder) . '"' . $attrString
        . ' class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">'
        . '<button type="button" class="password-toggle-btn absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" data-target="' . h($id) . '" title="Mostrar senha" aria-label="Mostrar senha">';
    icon('eye', 'h-4 w-4 password-toggle-icon-show');
    icon('eye-off', 'h-4 w-4 password-toggle-icon-hide hidden');
    echo '</button></div>';
}
