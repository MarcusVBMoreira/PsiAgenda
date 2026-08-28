<?php
// Validacao do formulario de paciente, portada de src/lib/validators/patients.ts.

declare(strict_types=1);

const TREATMENT_FREQUENCIES = ['semanal', 'quinzenal', 'mensal', 'outro'];
const PATIENT_STATUSES = ['ativo', 'inativo', 'encerrado'];
const REMINDER_LEAD_OVERRIDE = ['padrao', 'sim', 'nao'];

function optionalTrimmed(?string $value, int $max): ?string
{
    $value = trim((string) ($value ?? ''));
    if ($value === '') return null;
    return mb_substr($value, 0, $max);
}

function validatePatient(array $input): array
{
    $fullName = trim((string) ($input['fullName'] ?? ''));
    if (mb_strlen($fullName) < 3) {
        return ['ok' => false, 'error' => 'Informe o nome completo do paciente.'];
    }

    $birthDate = trim((string) ($input['birthDate'] ?? ''));
    $birthDate = $birthDate === '' ? null : $birthDate;

    $email = trim((string) ($input['email'] ?? ''));
    if ($email !== '' && !isValidEmail($email)) {
        return ['ok' => false, 'error' => 'E-mail invalido.'];
    }
    $email = $email === '' ? null : $email;

    $treatmentFrequency = (string) ($input['treatmentFrequency'] ?? '');
    if (!in_array($treatmentFrequency, TREATMENT_FREQUENCIES, true)) {
        return ['ok' => false, 'error' => 'Frequencia de tratamento invalida.'];
    }

    $status = (string) ($input['status'] ?? '');
    if (!in_array($status, PATIENT_STATUSES, true)) {
        return ['ok' => false, 'error' => 'Status invalido.'];
    }

    $remindersEnabled = (bool) ($input['remindersEnabled'] ?? true);

    $lead7 = (string) ($input['reminderLead7Dias'] ?? 'padrao');
    $lead2 = (string) ($input['reminderLead2Dias'] ?? 'padrao');
    $lead24 = (string) ($input['reminderLead24Horas'] ?? 'padrao');
    foreach ([$lead7, $lead2, $lead24] as $lead) {
        if (!in_array($lead, REMINDER_LEAD_OVERRIDE, true)) {
            return ['ok' => false, 'error' => 'Antecedencia de lembrete invalida.'];
        }
    }

    return [
        'ok' => true,
        'data' => [
            'fullName' => $fullName,
            'birthDate' => $birthDate,
            'phone' => optionalTrimmed($input['phone'] ?? null, 30),
            'email' => $email,
            'emergencyContactName' => optionalTrimmed($input['emergencyContactName'] ?? null, 255),
            'emergencyContactPhone' => optionalTrimmed($input['emergencyContactPhone'] ?? null, 30),
            'medicalHistory' => optionalTrimmed($input['medicalHistory'] ?? null, 10000),
            'medications' => optionalTrimmed($input['medications'] ?? null, 10000),
            'treatmentFrequency' => $treatmentFrequency,
            'status' => $status,
            'remindersEnabled' => $remindersEnabled,
            'reminderLead7Dias' => $lead7,
            'reminderLead2Dias' => $lead2,
            'reminderLead24Horas' => $lead24,
        ],
    ];
}
