<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/reschedule.php';
require_once __DIR__ . '/../app/reschedule.php';

$user = requireCurrentUserApi();
$sessionId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateReschedule($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}

try {
    $newSessionId = rescheduleSession($user['id'], $sessionId, $parsed['data']);
} catch (SessionNotFoundException) {
    jsonResponse(['error' => 'Agendamento nao encontrado.'], 404);
}

$patientId = dbOne('SELECT patient_id FROM sessions WHERE id = ?', [$newSessionId])['patient_id'] ?? null;

logAccess($user['id'], $patientId, 'session', $sessionId, 'editou');
logAccess($user['id'], $patientId, 'reschedule', $newSessionId, 'criou');

jsonResponse(['id' => $newSessionId], 201);
