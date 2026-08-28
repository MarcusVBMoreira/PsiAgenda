<?php
// Fluxo de reagendamento, portado de src/lib/reschedule.ts. Sempre cria
// uma nova sessao vinculada a original via a tabela reschedules, nunca
// um registro solto.

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/date_helpers.php';

class SessionNotFoundException extends Exception {}

function rescheduleSession(string $userId, string $originalSessionId, array $input): string
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$originalSessionId, $userId]);
        $original = $stmt->fetch();
        if ($original === false) {
            throw new SessionNotFoundException();
        }

        // Trava tambem a linha do paciente, pelo mesmo motivo de
        // createSessionWithSequentialNumber() — evita corrida de
        // sequential_number com um "novo agendamento" concorrente.
        $stmt = $pdo->prepare('SELECT id FROM patients WHERE id = ? FOR UPDATE');
        $stmt->execute([$original['patient_id']]);

        $stmt = $pdo->prepare('SELECT COALESCE(MAX(sequential_number), 0) + 1 AS next_number FROM sessions WHERE patient_id = ?');
        $stmt->execute([$original['patient_id']]);
        $sequentialNumber = (int) $stmt->fetch()['next_number'];

        $newSessionId = uuid();
        $stmt = $pdo->prepare(
            "INSERT INTO sessions (
               id, patient_id, user_id, sequential_number, scheduled_at,
               duration_minutes, modality, platform_link, status
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')"
        );
        $stmt->execute([
            $newSessionId, $original['patient_id'], $userId, $sequentialNumber,
            toMySQLDatetime($input['newScheduledAt']), $original['duration_minutes'],
            $original['modality'], $original['platform_link'],
        ]);

        $pdo->prepare("UPDATE sessions SET status = 'reagendado' WHERE id = ?")->execute([$originalSessionId]);

        $stmt = $pdo->prepare(
            'INSERT INTO reschedules (id, original_session_id, new_session_id, reason, requested_by, charged) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([uuid(), $originalSessionId, $newSessionId, $input['reason'], $input['requestedBy'], $input['charged']]);

        $pdo->commit();
        return $newSessionId;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
