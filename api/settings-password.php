<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/settings.php';

$user = requireCurrentUserApi();
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateChangePassword($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

$row = dbOne('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [$user['id']]);
if ($row === null) {
    jsonResponse(['error' => 'Usuario nao encontrado.'], 404);
}
if (!verifyPassword($data['currentPassword'], $row['password_hash'])) {
    jsonResponse(['error' => 'Senha atual incorreta.'], 401);
}

dbExec('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword($data['newPassword']), $user['id']]);
jsonResponse(['ok' => true]);
