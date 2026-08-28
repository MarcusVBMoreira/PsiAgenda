<?php
declare(strict_types=1);

const REQUESTED_BY_OPTIONS = ['paciente', 'profissional'];

function validateReschedule(array $input): array
{
    $newScheduledAt = trim((string) ($input['newScheduledAt'] ?? ''));
    if ($newScheduledAt === '') {
        return ['ok' => false, 'error' => 'Informe a nova data e horario.'];
    }

    $reason = trim((string) ($input['reason'] ?? ''));
    if ($reason === '') {
        return ['ok' => false, 'error' => 'Informe o motivo do reagendamento.'];
    }

    $requestedBy = (string) ($input['requestedBy'] ?? '');
    if (!in_array($requestedBy, REQUESTED_BY_OPTIONS, true)) {
        return ['ok' => false, 'error' => 'Solicitante invalido.'];
    }

    $charged = (bool) ($input['charged'] ?? false);

    return ['ok' => true, 'data' => compact('newScheduledAt', 'reason', 'requestedBy', 'charged')];
}
