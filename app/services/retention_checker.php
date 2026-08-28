<?php
// Portado de src/server/services/retention-checker/index.ts. 5 anos apos o
// caso ser encerrado (regra pratica, ajustavel) e um alerta 90 dias antes
// do prazo vencer.

declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../date_helpers.php';

const RETENTION_YEARS = 5;
const RETENTION_ALERT_LEAD_DAYS = 90;

function runRetentionChecker(): array
{
    $results = ['created' => 0];

    $patients = dbAll(
        "SELECT p.id, p.updated_at,
                (SELECT MAX(s.scheduled_at) FROM sessions s WHERE s.patient_id = p.id) AS last_session_at
         FROM patients p WHERE p.status = 'encerrado'"
    );

    foreach ($patients as $patient) {
        $referenceRaw = $patient['last_session_at'] ?? $patient['updated_at'];
        $referenceDate = parseISODate(extractDatePart((string) $referenceRaw));
        $deadline = clone $referenceDate;
        $deadline->modify('+' . RETENTION_YEARS . ' years');

        $daysUntilDeadline = (int) round(($deadline->getTimestamp() - time()) / 86400);
        if ($daysUntilDeadline > RETENTION_ALERT_LEAD_DAYS) continue;

        $existing = dbOne('SELECT id FROM retention_alerts WHERE patient_id = ? LIMIT 1', [$patient['id']]);
        if ($existing !== null) continue;

        dbExec(
            'INSERT INTO retention_alerts (id, patient_id, record_reference_date, retention_deadline, alert_sent) VALUES (?, ?, ?, ?, FALSE)',
            [uuid(), $patient['id'], formatISODate($referenceDate), formatISODate($deadline)]
        );
        $results['created']++;
    }

    return $results;
}
