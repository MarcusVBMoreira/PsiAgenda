<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/auth.php';
require_once __DIR__ . '/../app/verification_codes.php';
require_once __DIR__ . '/../app/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateLogin($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

$user = dbOne('SELECT id, password_hash, two_factor_enabled FROM users WHERE email = ? LIMIT 1', [$data['email']]);

if (!$user || !verifyPassword($data['password'], $user['password_hash'])) {
    jsonResponse(['error' => 'E-mail ou senha incorretos.'], 401);
}

if ((bool) $user['two_factor_enabled']) {
    $code = createVerificationCode($user['id'], 'dois_fatores');
    sendTwoFactorCodeEmail($data['email'], $code);
    createPending2FA($user['id']);
    jsonResponse(['requires2FA' => true]);
}

createSession($user['id']);
jsonResponse(['requires2FA' => false]);
