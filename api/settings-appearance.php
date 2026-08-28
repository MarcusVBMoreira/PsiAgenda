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
$parsed = validateAppearance($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}

dbExec('UPDATE users SET theme_preference = ? WHERE id = ?', [$parsed['data']['themePreference'], $user['id']]);
jsonResponse(['ok' => true]);
