<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/session_notes.php';

$user = requireCurrentUserApi();
$sessionId = (string) ($_GET['id'] ?? '');

$session = dbOne('SELECT id, patient_id, status FROM sessions WHERE id = ? AND user_id = ? LIMIT 1', [$sessionId, $user['id']]);
if ($session === null) {
    jsonResponse(['error' => 'Agendamento nao encontrado.'], 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $note = dbOne('SELECT * FROM session_notes WHERE session_id = ? LIMIT 1', [$sessionId]);
    if ($note !== null) {
        logAccess($user['id'], $session['patient_id'], 'session_note', $note['id'], 'visualizou');
    }
    jsonResponse(['note' => $note]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireValidCsrfApi();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $parsed = validateSessionNote($body);
    if (!$parsed['ok']) {
        jsonResponse(['error' => $parsed['error']], 400);
    }
    $data = $parsed['data'];

    $existing = dbOne('SELECT id FROM session_notes WHERE session_id = ? LIMIT 1', [$sessionId]);
    $noteId = $existing['id'] ?? uuid();

    if ($existing === null && $session['status'] !== 'confirmado') {
        jsonResponse(['error' => 'O registro de sessao so pode ser criado apos a sessao ser confirmada.'], 400);
    }

    if ($existing !== null) {
        dbExec(
            'UPDATE session_notes SET keyword_summary = ?, full_report = ?, theoretical_references = ? WHERE id = ?',
            [$data['keywordSummary'], $data['fullReport'], $data['theoreticalReferences'], $noteId]
        );
    } else {
        dbExec(
            'INSERT INTO session_notes (id, session_id, keyword_summary, full_report, theoretical_references) VALUES (?, ?, ?, ?, ?)',
            [$noteId, $sessionId, $data['keywordSummary'], $data['fullReport'], $data['theoreticalReferences']]
        );
    }

    // So passa confirmado -> finalizada. Uma sessao ja cancelada/reagendada
    // mantem seu status mesmo que o registro seja editado depois.
    dbExec("UPDATE sessions SET status = 'finalizada' WHERE id = ? AND status = 'confirmado'", [$sessionId]);

    logAccess($user['id'], $session['patient_id'], 'session_note', $noteId, $existing !== null ? 'editou' : 'criou');
    jsonResponse(['id' => $noteId]);
}

jsonResponse(['error' => 'Metodo nao permitido.'], 405);
