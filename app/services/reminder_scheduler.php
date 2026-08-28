<?php
// Portado de src/server/services/reminder-scheduler/index.ts. Roda 1x/dia
// via Cron Job externo (ver cron/reminders.php). Pra cada antecedencia,
// acha sessoes confirmadas caindo exatamente naquele dia, resolve se ela
// dispara via uma cascata de 3 niveis (sessao > paciente > padrao global
// do profissional), e — quando dispara — envia pelos canais habilitados.

declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../date_helpers.php';
require_once __DIR__ . '/../mailer.php';
require_once __DIR__ . '/../whatsapp.php';

const REMINDER_INTERVALS = [
    ['type' => '7_dias', 'days' => 7, 'preferenceColumn' => 'reminder_interval_7_dias', 'leadColumn' => 'reminder_lead_7_dias'],
    ['type' => '2_dias', 'days' => 2, 'preferenceColumn' => 'reminder_interval_2_dias', 'leadColumn' => 'reminder_lead_2_dias'],
    ['type' => '24_horas', 'days' => 1, 'preferenceColumn' => 'reminder_interval_24_horas', 'leadColumn' => 'reminder_lead_24_horas'],
];

const REMINDER_CHANNELS = [
    ['type' => 'email', 'preferenceColumn' => 'reminder_channel_email', 'destinationColumn' => 'patient_email'],
    ['type' => 'whatsapp', 'preferenceColumn' => 'reminder_channel_whatsapp', 'destinationColumn' => 'patient_phone'],
];

function runReminderScheduler(): array
{
    $results = ['created' => 0, 'sent' => 0, 'failed' => 0];

    foreach (REMINDER_INTERVALS as $interval) {
        $leadColumn = $interval['leadColumn'];
        $preferenceColumn = $interval['preferenceColumn'];

        $sessions = dbAll(
            "SELECT s.id AS session_id, s.patient_id, s.scheduled_at,
                    p.full_name AS patient_name, p.email AS patient_email, p.phone AS patient_phone,
                    u.full_name AS professional_name,
                    CASE
                      WHEN s.$leadColumn <> 'padrao' THEN (s.$leadColumn = 'sim')
                      WHEN p.$leadColumn <> 'padrao' THEN (p.$leadColumn = 'sim')
                      ELSE u.$preferenceColumn
                    END AS interval_enabled,
                    u.reminder_channel_email, u.reminder_channel_whatsapp
             FROM sessions s
             JOIN patients p ON p.id = s.patient_id
             JOIN users u ON u.id = s.user_id
             WHERE s.status = 'confirmado'
               AND s.send_reminders = TRUE
               AND p.reminders_enabled = TRUE
               AND DATE(s.scheduled_at) = DATE(DATE_ADD(NOW(), INTERVAL ? DAY))",
            [$interval['days']]
        );

        foreach ($sessions as $session) {
            if (!$session['interval_enabled']) continue;

            foreach (REMINDER_CHANNELS as $channel) {
                if (!$session[$channel['preferenceColumn']]) continue;

                $existing = dbOne(
                    'SELECT id FROM reminders WHERE session_id = ? AND interval_type = ? AND channel = ? LIMIT 1',
                    [$session['session_id'], $interval['type'], $channel['type']]
                );
                if ($existing !== null) continue;

                $destination = $session[$channel['destinationColumn']];
                $status = 'enviado';

                if (!$destination) {
                    $status = 'falhou';
                } else {
                    try {
                        $datePart = extractDatePart($session['scheduled_at']);
                        $params = [
                            'patientName' => $session['patient_name'],
                            'professionalName' => $session['professional_name'],
                            'dateLabel' => formatDateLabel(parseISODate($datePart)),
                            'timeLabel' => extractTimePart($session['scheduled_at']),
                        ];
                        if ($channel['type'] === 'email') {
                            sendSessionReminderEmail($destination, $params);
                        } else {
                            sendSessionReminderWhatsApp($destination, $params);
                        }
                    } catch (Exception $e) {
                        error_log("[reminder-scheduler] falha ao enviar lembrete via {$channel['type']}: " . $e->getMessage());
                        $status = 'falhou';
                    }
                }

                dbExec(
                    'INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [uuid(), $session['session_id'], $session['patient_id'], $interval['type'], $channel['type'], $status, $status === 'enviado' ? date('Y-m-d H:i:s') : null]
                );

                $results['created']++;
                if ($status === 'enviado') $results['sent']++; else $results['failed']++;
            }
        }
    }

    return $results;
}
