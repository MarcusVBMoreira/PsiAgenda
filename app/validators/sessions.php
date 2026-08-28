<?php
// Validacao de sessao/agendamento, portada de src/lib/validators/sessions.ts.

declare(strict_types=1);

require_once __DIR__ . '/patients.php'; // REMINDER_LEAD_OVERRIDE

const SESSION_STATUSES = ['livre', 'pendente', 'confirmado', 'reagendado', 'cancelado_cobrado', 'cancelado_sem_cobranca'];
const CANCELLED_STATUSES = ['cancelado_cobrado', 'cancelado_sem_cobranca'];
const MODALITIES = ['presencial', 'online'];

function validateDurationMinutes($value): ?int
{
    if (!is_numeric($value)) return null;
    $n = (int) $value;
    if ($n < 5 || $n > 480) return null;
    return $n;
}

function reminderLeadFieldsFrom(array $input): array
{
    $out = [];
    foreach (['reminderLead7Dias', 'reminderLead2Dias', 'reminderLead24Horas'] as $key) {
        $value = (string) ($input[$key] ?? 'padrao');
        if (!in_array($value, REMINDER_LEAD_OVERRIDE, true)) {
            $value = 'padrao';
        }
        $out[$key] = $value;
    }
    return $out;
}

function validateCreateSession(array $input): array
{
    $patientId = trim((string) ($input['patientId'] ?? ''));
    if ($patientId === '') {
        return ['ok' => false, 'error' => 'Selecione um paciente.'];
    }

    $scheduledAt = trim((string) ($input['scheduledAt'] ?? ''));
    if ($scheduledAt === '') {
        return ['ok' => false, 'error' => 'Informe a data e horario.'];
    }

    $durationMinutes = validateDurationMinutes($input['durationMinutes'] ?? null);
    if ($durationMinutes === null) {
        return ['ok' => false, 'error' => 'Duracao invalida (5 a 480 minutos).'];
    }

    $modality = (string) ($input['modality'] ?? '');
    if (!in_array($modality, MODALITIES, true)) {
        return ['ok' => false, 'error' => 'Modalidade invalida.'];
    }

    $status = (string) ($input['status'] ?? '');
    if (!in_array($status, SESSION_STATUSES, true)) {
        return ['ok' => false, 'error' => 'Status invalido.'];
    }

    $platformLink = trim((string) ($input['platformLink'] ?? ''));
    $platformLink = $platformLink === '' ? null : mb_substr($platformLink, 0, 500);

    return [
        'ok' => true,
        'data' => array_merge([
            'patientId' => $patientId,
            'scheduledAt' => $scheduledAt,
            'durationMinutes' => $durationMinutes,
            'modality' => $modality,
            'platformLink' => $platformLink,
            'status' => $status,
            'sendConfirmation' => (bool) ($input['sendConfirmation'] ?? true),
            'sendReminders' => (bool) ($input['sendReminders'] ?? true),
        ], reminderLeadFieldsFrom($input)),
    ];
}

function validateUpdateSession(array $input): array
{
    $scheduledAt = trim((string) ($input['scheduledAt'] ?? ''));
    if ($scheduledAt === '') {
        return ['ok' => false, 'error' => 'Informe a data e horario.'];
    }

    $durationMinutes = validateDurationMinutes($input['durationMinutes'] ?? null);
    if ($durationMinutes === null) {
        return ['ok' => false, 'error' => 'Duracao invalida (5 a 480 minutos).'];
    }

    $modality = (string) ($input['modality'] ?? '');
    if (!in_array($modality, MODALITIES, true)) {
        return ['ok' => false, 'error' => 'Modalidade invalida.'];
    }

    $status = (string) ($input['status'] ?? '');
    if (!in_array($status, SESSION_STATUSES, true)) {
        return ['ok' => false, 'error' => 'Status invalido.'];
    }

    $platformLink = trim((string) ($input['platformLink'] ?? ''));
    $platformLink = $platformLink === '' ? null : mb_substr($platformLink, 0, 500);

    $cancellationReason = trim((string) ($input['cancellationReason'] ?? ''));
    $cancellationReason = $cancellationReason === '' ? null : mb_substr($cancellationReason, 0, 2000);

    if (in_array($status, CANCELLED_STATUSES, true) && !$cancellationReason) {
        return ['ok' => false, 'error' => 'Informe o motivo do cancelamento.'];
    }

    return [
        'ok' => true,
        'data' => array_merge([
            'scheduledAt' => $scheduledAt,
            'durationMinutes' => $durationMinutes,
            'modality' => $modality,
            'platformLink' => $platformLink,
            'status' => $status,
            'cancellationReason' => $cancellationReason,
            'sendConfirmation' => (bool) ($input['sendConfirmation'] ?? true),
            'sendReminders' => (bool) ($input['sendReminders'] ?? true),
        ], reminderLeadFieldsFrom($input)),
    ];
}
