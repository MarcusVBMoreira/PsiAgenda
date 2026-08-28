<?php
// Autenticacao dos endpoints de cron, portado de src/lib/cron-auth.ts.
// Chamados por um agendador externo (Cron Jobs do hPanel), sem sessao de
// usuario — exige um token compartilhado via ?token=... ou header
// Authorization: Bearer.

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function isAuthorizedCronRequest(): bool
{
    $secret = CRON_SECRET;
    if (!$secret) return false;

    $tokenFromQuery = $_GET['token'] ?? null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? (function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? null) : null);
    $tokenFromHeader = ($authHeader && str_starts_with($authHeader, 'Bearer ')) ? substr($authHeader, 7) : null;

    $provided = $tokenFromQuery ?? $tokenFromHeader;
    return $provided !== null && hash_equals($secret, (string) $provided);
}
