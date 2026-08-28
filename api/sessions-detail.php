<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/sessions.php';
require_once __DIR__ . '/../app/date_helpers.php';
require_once __DIR__ . '/../app/session_messaging.php';

$user = requireCurrentUserApi();
$sessionId = (string) ($_GET['id'] ?? '');

function findSessionRow(string $sessionId, string $userId): ?array
{
    return dbOne(
        'SELECT s.*, p.full_name AS patient_name, p.reminders_enabled AS patient_reminders_enabled,
                p.reminder_lead_7_dias AS patient_reminder_lead_7_dias,
                p.reminder_lead_2_dias AS patient_reminder_lead_2_dias,
                p.reminder_lead_24_horas AS patient_reminder_lead_24_horas
         FROM sessions s
         JOIN patients p ON p.id = s.patient_id
         WHERE s.id = ? AND s.user_id = ?
         LIMIT 1',
        [$sessionId, $userId]
    );
}

$existing = findSessionRow($sessionId, $user['id']);
if ($existing === null) {
    jsonResponse(['error' => 'Agendamento nao encontrado.'], 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $hasNote = dbOne('SELECT id FROM session_notes WHERE session_id = ? LIMIT 1', [$sessionId]) !== null;
    $rescheduledTo = dbOne(
        'SELECT s.id, s.scheduled_at FROM reschedules r JOIN sessions s ON s.id = r.new_session_id WHERE r.original_session_id = ? LIMIT 1',
        [$sessionId]
    );
    $rescheduledFrom = dbOne(
        'SELECT r.reason, r.requested_by, r.charged, s.id AS original_session_id, s.scheduled_at
         FROM reschedules r JOIN sessions s ON s.id = r.original_session_id WHERE r.new_session_id = ? LIMIT 1',
        [$sessionId]
    );

    logAccess($user['id'], $existing['patient_id'], 'session', $existing['id'], 'visualizou');

    jsonResponse(['session' => array_merge($existing, [
        'has_note' => $hasNote,
        'rescheduled_to' => $rescheduledTo,
        'rescheduled_from' => $rescheduledFrom,
    ])]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireValidCsrfApi();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $parsed = validateUpdateSession($body);
    if (!$parsed['ok']) {
        jsonResponse(['error' => $parsed['error']], 400);
    }
    $data = $parsed['data'];

    dbExec(
        'UPDATE sessions SET
           scheduled_at = ?, duration_minutes = ?, modality = ?, platform_link = ?, status = ?,
           cancellation_reason = ?, send_confirmation = ?, send_reminders = ?,
           reminder_lead_7_dias = ?, reminder_lead_2_dias = ?, reminder_lead_24_horas = ?
         WHERE id = ? AND user_id = ?',
        [
            toMySQLDatetime($data['scheduledAt']), $data['durationMinutes'], $data['modality'], $data['platformLink'],
            $data['status'], $data['cancellationReason'], $data['sendConfirmation'], $data['sendReminders'],
            $data['reminderLead7Dias'], $data['reminderLead2Dias'], $data['reminderLead24Horas'],
            $sessionId, $user['id'],
        ]
    );

    logAccess($user['id'], $existing['patient_id'], 'session', $sessionId, 'editou');
    maybeAutoSendConfirmation($sessionId, $user['id'], $existing['status'], $data['status']);

    jsonResponse(['ok' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireValidCsrfApi();
    dbExec('DELETE FROM sessions WHERE id = ? AND user_id = ?', [$sessionId, $user['id']]);
    logAccess($user['id'], $existing['patient_id'], 'session', $sessionId, 'excluiu');
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Metodo nao permitido.'], 405);
