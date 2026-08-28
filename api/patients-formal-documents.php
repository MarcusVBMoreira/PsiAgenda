<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/formal_document.php';
require_once __DIR__ . '/../app/document_storage.php';
require_once __DIR__ . '/../app/services/pdf/formal_document_pdf.php';

$user = requireCurrentUserApi();
$patientId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateFormalDocument($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

$patient = dbOne('SELECT id, full_name FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $user['id']]);
if ($patient === null) {
    jsonResponse(['error' => 'Paciente nao encontrado.'], 404);
}

try {
    $pdfBytes = generateFormalDocumentPdf(
        ['fullName' => $user['fullName'], 'crpNumber' => $user['crpNumber']],
        ['fullName' => $patient['full_name']],
        $data['type'],
        $data['title'],
        $data['body']
    );
} catch (PdfGenerationException $e) {
    jsonResponse(['error' => 'Nao foi possivel gerar o PDF: ' . $e->getMessage()], 502);
}

$documentId = uuid();
savePdfFile("$documentId.pdf", $pdfBytes);

dbExec(
    'INSERT INTO documents (id, patient_id, session_id, type, file_url, patient_readable_version) VALUES (?, ?, NULL, ?, ?, FALSE)',
    [$documentId, $patientId, $data['type'], "$documentId.pdf"]
);
logAccess($user['id'], $patientId, 'document', $documentId, 'criou');

jsonResponse(['id' => $documentId], 201);
