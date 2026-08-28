<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/document_storage.php';

$user = requireCurrentUserApi();
$documentId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$document = dbOne(
    'SELECT d.id, d.patient_id, d.file_url FROM documents d JOIN patients p ON p.id = d.patient_id WHERE d.id = ? AND p.user_id = ? LIMIT 1',
    [$documentId, $user['id']]
);
if ($document === null) {
    jsonResponse(['error' => 'Documento nao encontrado.'], 404);
}

dbExec('DELETE FROM documents WHERE id = ?', [$documentId]);
deletePdfFile($document['file_url']);

logAccess($user['id'], $document['patient_id'], 'document', $documentId, 'excluiu');
jsonResponse(['ok' => true]);
