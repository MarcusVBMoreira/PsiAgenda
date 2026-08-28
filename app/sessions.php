<?php
// Criacao de sessao com numeracao sequencial por paciente, portada de
// src/lib/sessions.ts.

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/date_helpers.php';

class PatientNotFoundException extends Exception {}

function createSessionWithSequentialNumber(string $userId, array $input): string
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        // Trava a linha do paciente (que sempre existe) em vez do agregado
        // MAX(...) sobre sessions (que nao trava nada quando o paciente
        // ainda nao tem nenhuma sessao) — evita deadlock/corrida na primeira
        // sessao de um paciente sob concorrencia.
        $stmt = $pdo->prepare('SELECT id FROM patients WHERE id = ? AND user_id = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$input['patientId'], $userId]);
        if ($stmt->fetch() === false) {
            throw new PatientNotFoundException();
        }

        $stmt = $pdo->prepare('SELECT COALESCE(MAX(sequential_number), 0) + 1 AS next_number FROM sessions WHERE patient_id = ?');
        $stmt->execute([$input['patientId']]);
        $sequentialNumber = (int) $stmt->fetch()['next_number'];

        $id = uuid();
        $stmt = $pdo->prepare(
            'INSERT INTO sessions (
               id, patient_id, user_id, sequential_number, scheduled_at,
               duration_minutes, modality, platform_link, status,
               send_confirmation, send_reminders,
               reminder_lead_7_dias, reminder_lead_2_dias, reminder_lead_24_horas
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $input['patientId'],
            $userId,
            $sequentialNumber,
            toMySQLDatetime($input['scheduledAt']),
            $input['durationMinutes'],
            $input['modality'],
            $input['platformLink'],
            $input['status'],
            $input['sendConfirmation'],
            $input['sendReminders'],
            $input['reminderLead7Dias'],
            $input['reminderLead2Dias'],
            $input['reminderLead24Horas'],
        ]);

        $pdo->commit();
        return $id;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
