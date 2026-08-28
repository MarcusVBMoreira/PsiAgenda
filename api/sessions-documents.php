<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/document_storage.php';
require_once __DIR__ . '/../app/services/pdf/session_pdf.php';

$user = requireCurrentUserApi();
$sessionId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$session = dbOne(
    'SELECT s.*, p.full_name AS patient_name FROM sessions s JOIN patients p ON p.id = s.patient_id WHERE s.id = ? AND s.user_id = ? LIMIT 1',
    [$sessionId, $user['id']]
);
if ($session === null) {
    jsonResponse(['error' => 'Agendamento nao encontrado.'], 404);
}

$note = dbOne('SELECT * FROM session_notes WHERE session_id = ? LIMIT 1', [$sessionId]);
if ($note === null) {
    jsonResponse(['error' => 'Esta sessao ainda nao tem um registro de sessao para exportar.'], 400);
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$includeAccessible = (bool) ($body['includeAccessible'] ?? false);

$professional = ['fullName' => $user['fullName'], 'crpNumber' => $user['crpNumber']];
$patientData = ['fullName' => $session['patient_name']];
$sessionData = [
    'sequentialNumber' => $session['sequential_number'], 'scheduledAt' => $session['scheduled_at'],
    'durationMinutes' => $session['duration_minutes'], 'modality' => $session['modality'],
];
$noteData = [
    'keywordSummary' => $note['keyword_summary'], 'fullReport' => $note['full_report'],
    'theoreticalReferences' => $note['theoretical_references'],
];

$variants = $includeAccessible ? [false, true] : [false];
$created = [];

try {
    foreach ($variants as $accessible) {
        $pdfBytes = generateSessionPdf($professional, $patientData, $sessionData, $noteData, $accessible);
        $documentId = uuid();
        $filename = "$documentId.pdf";
        savePdfFile($filename, $pdfBytes);

        dbExec(
            "INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version) VALUES (?, ?, ?, 'pdf_sessao', ?, ?)",
            [$documentId, $session['patient_id'], $sessionId, $filename, $accessible]
        );
        logAccess($user['id'], $session['patient_id'], 'document', $documentId, 'criou');
        $created[] = ['id' => $documentId, 'type' => 'pdf_sessao', 'patientReadableVersion' => $accessible];
    }
} catch (PdfGenerationException $e) {
    jsonResponse(['error' => 'Nao foi possivel gerar o PDF: ' . $e->getMessage()], 502);
}

jsonResponse(['documents' => $created], 201);
