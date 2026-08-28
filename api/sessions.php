<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/sessions.php';
require_once __DIR__ . '/../app/sessions.php';
require_once __DIR__ . '/../app/session_messaging.php';

$user = requireCurrentUserApi();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateCreateSession($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

try {
    $id = createSessionWithSequentialNumber($user['id'], $data);
} catch (PatientNotFoundException) {
    jsonResponse(['error' => 'Paciente nao encontrado.'], 404);
}

logAccess($user['id'], $data['patientId'], 'session', $id, 'criou');
maybeAutoSendConfirmation($id, $user['id'], '', $data['status']);

jsonResponse(['id' => $id], 201);
