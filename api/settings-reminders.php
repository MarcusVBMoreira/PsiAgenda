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
$parsed = validateReminderPreferences($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

dbExec(
    'UPDATE users SET reminder_channel_email = ?, reminder_channel_whatsapp = ?,
       reminder_interval_7_dias = ?, reminder_interval_2_dias = ?, reminder_interval_24_horas = ? WHERE id = ?',
    [$data['channelEmail'], $data['channelWhatsapp'], $data['interval7Dias'], $data['interval2Dias'], $data['interval24Horas'], $user['id']]
);
jsonResponse(['ok' => true]);
