<?php
// Portado de src/server/services/adherence-checker/index.ts.

declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../date_helpers.php';

const ADHERENCE_FREQUENCY_DAYS = ['semanal' => 7, 'quinzenal' => 14, 'mensal' => 30];
const ADHERENCE_DEVIATION_FACTOR = 1.5;

function daysBetweenIso(string $newer, string $older): int
{
    $a = parseISODate(extractDatePart($newer));
    $b = parseISODate(extractDatePart($older));
    return (int) round(($a->getTimestamp() - $b->getTimestamp()) / 86400);
}

function runAdherenceChecker(): array
{
    $results = ['created' => 0];

    $patients = dbAll(
        "SELECT id, treatment_frequency FROM patients WHERE status = 'ativo' AND treatment_frequency IN ('semanal', 'quinzenal', 'mensal')"
    );

    foreach ($patients as $patient) {
        $expected = ADHERENCE_FREQUENCY_DAYS[$patient['treatment_frequency']];

        $sessions = dbAll(
            "SELECT scheduled_at FROM sessions WHERE patient_id = ? AND status = 'finalizada' ORDER BY scheduled_at DESC LIMIT 2",
            [$patient['id']]
        );
        if (count($sessions) < 2) continue;

        $actualDays = daysBetweenIso($sessions[0]['scheduled_at'], $sessions[1]['scheduled_at']);
        if ($actualDays <= $expected * ADHERENCE_DEVIATION_FACTOR) continue;

        $existing = dbOne("SELECT id FROM adherence_alerts WHERE patient_id = ? AND status = 'pendente' LIMIT 1", [$patient['id']]);
        if ($existing !== null) continue;

        dbExec(
            'INSERT INTO adherence_alerts (id, patient_id, expected_interval_days, actual_interval_days) VALUES (?, ?, ?, ?)',
            [uuid(), $patient['id'], $expected, $actualDays]
        );
        $results['created']++;
    }

    return $results;
}
