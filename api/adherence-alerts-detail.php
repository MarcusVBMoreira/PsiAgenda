<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$user = requireCurrentUserApi();
$alertId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$alert = dbOne(
    'SELECT a.id, a.patient_id FROM adherence_alerts a JOIN patients p ON p.id = a.patient_id WHERE a.id = ? AND p.user_id = ? LIMIT 1',
    [$alertId, $user['id']]
);
if ($alert === null) {
    jsonResponse(['error' => 'Alerta nao encontrado.'], 404);
}

dbExec("UPDATE adherence_alerts SET status = 'revisado' WHERE id = ?", [$alertId]);
logAccess($user['id'], $alert['patient_id'], 'adherence_alert', $alertId, 'editou');

jsonResponse(['ok' => true]);
