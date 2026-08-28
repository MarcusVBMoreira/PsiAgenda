<?php
// Formatacao de telefone, portado de src/lib/format.ts.

declare(strict_types=1);

function formatBrazilianPhone(string $value): string
{
    $digits = substr(preg_replace('/\D/', '', $value), 0, 11);
    $len = strlen($digits);

    if ($len === 0) return '';
    if ($len <= 2) return "($digits";
    if ($len <= 6) return '(' . substr($digits, 0, 2) . ') ' . substr($digits, 2);
    if ($len <= 10) return '(' . substr($digits, 0, 2) . ') ' . substr($digits, 2, 4) . '-' . substr($digits, 6);
    return '(' . substr($digits, 0, 2) . ') ' . substr($digits, 2, 5) . '-' . substr($digits, 7, 4);
}

/** Digitos com DDI do Brasil, formato que a Meta Cloud API espera em "to". */
function toWhatsAppNumber(string $value): string
{
    $digits = preg_replace('/\D/', '', $value);
    if ($digits === '') return '';
    if (str_starts_with($digits, '55') && strlen($digits) > 11) return $digits;
    return '55' . $digits;
}

/** Escapa texto pra uso seguro dentro de HTML (equivalente ao JSX auto-escape). */
function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}
