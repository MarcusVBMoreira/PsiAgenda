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
$parsed = validateSecurity($body);

dbExec('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [$parsed['data']['twoFactorEnabled'], $user['id']]);
jsonResponse(['ok' => true]);
