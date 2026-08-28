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
$parsed = validateBillingPolicy($body);

dbExec('UPDATE users SET no_show_charge_policy = ? WHERE id = ?', [$parsed['data']['noShowChargePolicy'], $user['id']]);
jsonResponse(['ok' => true]);
