<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/auth.php';
require_once __DIR__ . '/../app/verification_codes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$userId = pendingTwoFactorUserId();
if (!$userId) {
    jsonResponse(['error' => 'Sessao de verificacao expirada. Faca login novamente.'], 401);
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateVerifyCode($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}

$isValid = verifyAndConsumeCode($userId, 'dois_fatores', $parsed['data']['code']);
if (!$isValid) {
    jsonResponse(['error' => 'Codigo invalido ou expirado.'], 400);
}

clearPending2FA();
createSession($userId);

jsonResponse(['ok' => true]);
