<?php
// Envio de confirmacao/lembrete de sessao — versao stub por enquanto.
// Implementacao completa (e-mail via PHPMailer, WhatsApp via Meta Cloud
// API, envio manual) entra na Fase 5 da migracao (Comunicacao e
// automacao). Por ora so evita quebrar o fluxo de criar/editar sessao.

declare(strict_types=1);

function maybeAutoSendConfirmation(string $sessionId, string $userId, string $previousStatus, string $newStatus): void
{
    // TODO(Fase 5): replicar a logica de src/lib/session-messaging.ts —
    // dispara e-mail/whatsapp quando a sessao passa a "confirmado" pela
    // primeira vez, respeitando send_confirmation, reminders_enabled do
    // paciente, e marcando sessions.confirmation_sent_at.
}
