<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/auth.php';
require_once __DIR__ . '/../app/verification_codes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateConfirmPasswordReset($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

$user = dbOne('SELECT id FROM users WHERE email = ? LIMIT 1', [$data['email']]);
if (!$user) {
    jsonResponse(['error' => 'Codigo invalido ou expirado.'], 400);
}

$isValid = verifyAndConsumeCode($user['id'], 'recuperacao_senha', $data['code']);
if (!$isValid) {
    jsonResponse(['error' => 'Codigo invalido ou expirado.'], 400);
}

$passwordHash = hashPassword($data['newPassword']);
dbExec('UPDATE users SET password_hash = ? WHERE id = ?', [$passwordHash, $user['id']]);

jsonResponse(['ok' => true]);
