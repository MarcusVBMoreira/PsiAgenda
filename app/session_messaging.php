<?php
// Envio de confirmacao/lembrete de sessao, portado de
// src/lib/session-messaging.ts.

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/date_helpers.php';
require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/whatsapp.php';

function findSessionMessagingContext(string $sessionId, string $userId): ?array
{
    return dbOne(
        'SELECT s.id, s.patient_id, s.user_id, s.scheduled_at, s.status,
                s.send_confirmation, s.send_reminders, s.confirmation_sent_at,
                p.full_name AS patient_name, p.email AS patient_email, p.phone AS patient_phone,
                p.reminders_enabled AS patient_reminders_enabled,
                u.full_name AS professional_name,
                u.reminder_channel_email, u.reminder_channel_whatsapp
         FROM sessions s
         JOIN patients p ON p.id = s.patient_id
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.user_id = ?
         LIMIT 1',
        [$sessionId, $userId]
    );
}

function dateTimeLabelsFor(string $scheduledAt): array
{
    $datePart = extractDatePart($scheduledAt);
    return ['dateLabel' => formatDateLabel(parseISODate($datePart)), 'timeLabel' => extractTimePart($scheduledAt)];
}

/** @return array{email: bool, whatsapp: bool} */
function sendViaEnabledChannels(array $session, string $kind): array
{
    $labels = dateTimeLabelsFor($session['scheduled_at']);
    $params = [
        'patientName' => $session['patient_name'],
        'professionalName' => $session['professional_name'],
        'dateLabel' => $labels['dateLabel'],
        'timeLabel' => $labels['timeLabel'],
    ];

    $email = false;
    $whatsapp = false;

    if ($session['reminder_channel_email'] && $session['patient_email']) {
        if ($kind === 'confirmation') sendSessionConfirmationEmail($session['patient_email'], $params);
        else sendSessionReminderEmail($session['patient_email'], $params);
        $email = true;
    }
    if ($session['reminder_channel_whatsapp'] && $session['patient_phone']) {
        if ($kind === 'confirmation') sendSessionConfirmationWhatsApp($session['patient_phone'], $params);
        else sendSessionReminderWhatsApp($session['patient_phone'], $params);
        $whatsapp = true;
    }

    return ['email' => $email, 'whatsapp' => $whatsapp];
}

/** Envia a confirmacao agora, independente de send_confirmation/ja enviada — usado pelo trigger automatico (que checa isso antes) e pelo botao manual. */
function sendConfirmationNow(string $sessionId, string $userId): array
{
    $session = findSessionMessagingContext($sessionId, $userId);
    if ($session === null) {
        return ['ok' => false, 'error' => 'Agendamento nao encontrado.'];
    }

    $result = sendViaEnabledChannels($session, 'confirmation');
    dbExec('UPDATE sessions SET confirmation_sent_at = NOW() WHERE id = ?', [$sessionId]);

    return ['ok' => true, 'email' => $result['email'], 'whatsapp' => $result['whatsapp']];
}

/** Envia um lembrete agora (botao "enviar lembrete agora") — registrado com interval_type='manual'. */
function sendReminderNow(string $sessionId, string $userId): array
{
    $session = findSessionMessagingContext($sessionId, $userId);
    if ($session === null) {
        return ['ok' => false, 'error' => 'Agendamento nao encontrado.'];
    }

    $result = sendViaEnabledChannels($session, 'reminder');

    if ($result['email']) {
        dbExec(
            "INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at) VALUES (?, ?, ?, 'manual', 'email', 'enviado', NOW())",
            [uuid(), $sessionId, $session['patient_id']]
        );
    }
    if ($result['whatsapp']) {
        dbExec(
            "INSERT INTO reminders (id, session_id, patient_id, interval_type, channel, status, sent_at) VALUES (?, ?, ?, 'manual', 'whatsapp', 'enviado', NOW())",
            [uuid(), $sessionId, $session['patient_id']]
        );
    }

    return ['ok' => true, 'email' => $result['email'], 'whatsapp' => $result['whatsapp']];
}

/**
 * Chamada logo apos o status de uma sessao ser atualizado — se acabou de
 * virar "confirmado" (e nao estava assim antes), a sessao permite
 * confirmacoes, o paciente nao desabilitou, e nenhuma foi enviada ainda,
 * envia automaticamente. Nunca lanca excecao — e efeito colateral de um
 * save, nao deve derrubar o save em si.
 */
function maybeAutoSendConfirmation(string $sessionId, string $userId, string $previousStatus, string $newStatus): void
{
    if ($newStatus !== 'confirmado' || $previousStatus === 'confirmado') {
        return;
    }

    try {
        $session = findSessionMessagingContext($sessionId, $userId);
        if ($session === null) return;
        if (!$session['send_confirmation']) return;
        if (!$session['patient_reminders_enabled']) return;
        if ($session['confirmation_sent_at']) return;

        sendConfirmationNow($sessionId, $userId);
    } catch (Exception $e) {
        error_log('[session-messaging] falha ao enviar confirmacao automatica: ' . $e->getMessage());
    }
}
