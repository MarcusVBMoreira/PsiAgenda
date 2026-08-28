<?php
// Trilha de auditoria, portada de src/lib/access-log.ts.

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function logAccess(string $userId, ?string $patientId, string $recordType, string $recordId, string $action): void
{
    dbExec(
        'INSERT INTO access_logs (id, user_id, patient_id, record_type, record_id, action) VALUES (?, ?, ?, ?, ?, ?)',
        [uuid(), $userId, $patientId, $recordType, $recordId, $action]
    );
}
