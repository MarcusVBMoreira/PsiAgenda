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
$parsed = validateProfile($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

dbExec('UPDATE users SET full_name = ?, crp_number = ?, phone = ? WHERE id = ?', [$data['fullName'], $data['crpNumber'], $data['phone'], $user['id']]);
jsonResponse(['ok' => true]);
