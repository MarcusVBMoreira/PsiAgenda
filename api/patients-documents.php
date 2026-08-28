<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/document_storage.php';
require_once __DIR__ . '/../app/services/pdf/patient_pdf.php';

$user = requireCurrentUserApi();
$patientId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$patient = dbOne('SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $user['id']]);
if ($patient === null) {
    jsonResponse(['error' => 'Paciente nao encontrado.'], 404);
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$includeAccessible = (bool) ($body['includeAccessible'] ?? false);

$sessionRows = dbAll(
    'SELECT s.sequential_number, s.scheduled_at, s.status, n.keyword_summary
     FROM sessions s LEFT JOIN session_notes n ON n.session_id = s.id
     WHERE s.patient_id = ? AND s.user_id = ? ORDER BY s.scheduled_at ASC',
    [$patientId, $user['id']]
);

$professional = ['fullName' => $user['fullName'], 'crpNumber' => $user['crpNumber']];
$patientData = [
    'fullName' => $patient['full_name'], 'birthDate' => $patient['birth_date'],
    'phone' => $patient['phone'], 'email' => $patient['email'],
    'treatmentFrequency' => $patient['treatment_frequency'],
    'medicalHistory' => $patient['medical_history'], 'medications' => $patient['medications'],
];
$sessions = array_map(fn($s) => [
    'sequentialNumber' => $s['sequential_number'], 'scheduledAt' => $s['scheduled_at'],
    'status' => $s['status'], 'keywordSummary' => $s['keyword_summary'],
], $sessionRows);

$variants = $includeAccessible ? [false, true] : [false];
$created = [];

try {
    foreach ($variants as $accessible) {
        $pdfBytes = generatePatientPdf($professional, $patientData, $sessions, $accessible);
        $documentId = uuid();
        $filename = "$documentId.pdf";
        savePdfFile($filename, $pdfBytes);

        dbExec(
            "INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version) VALUES (?, ?, NULL, 'pdf_geral', ?, ?)",
            [$documentId, $patientId, $filename, $accessible]
        );
        logAccess($user['id'], $patientId, 'document', $documentId, 'criou');
        $created[] = ['id' => $documentId, 'type' => 'pdf_geral', 'patientReadableVersion' => $accessible];
    }
} catch (PdfGenerationException $e) {
    jsonResponse(['error' => 'Nao foi possivel gerar o PDF: ' . $e->getMessage()], 502);
}

jsonResponse(['documents' => $created], 201);
