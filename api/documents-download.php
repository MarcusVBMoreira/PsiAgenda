<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/document_storage.php';
require_once __DIR__ . '/../app/document_meta.php';

$user = requireCurrentUserApi();
$documentId = (string) ($_GET['id'] ?? '');

function slugifyForFilename(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT', $value) ?: $value;
    $value = preg_replace('/[^a-zA-Z0-9]+/', '-', $value);
    $value = trim($value, '-');
    return strtolower($value);
}

$document = dbOne(
    'SELECT d.*, p.full_name AS patient_name FROM documents d JOIN patients p ON p.id = d.patient_id WHERE d.id = ? AND p.user_id = ? LIMIT 1',
    [$documentId, $user['id']]
);
if ($document === null) {
    jsonResponse(['error' => 'Documento nao encontrado.'], 404);
}

$bytes = readPdfFile($document['file_url']);

logAccess($user['id'], $document['patient_id'], 'document', $document['id'], 'visualizou');

$typeLabel = DOCUMENT_TYPE_LABELS[$document['type']] ?? $document['type'];
$filename = slugifyForFilename($typeLabel) . '-' . slugifyForFilename($document['patient_name']) . '.pdf';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . strlen($bytes));
echo $bytes;
