<?php
declare(strict_types=1);

function validateProfile(array $input): array
{
    $fullName = trim((string) ($input['fullName'] ?? ''));
    if (mb_strlen($fullName) < 3) {
        return ['ok' => false, 'error' => 'Informe o nome completo.'];
    }
    $crpNumber = trim((string) ($input['crpNumber'] ?? ''));
    if ($crpNumber === '') {
        return ['ok' => false, 'error' => 'Informe o numero do CRP.'];
    }
    $phone = trim((string) ($input['phone'] ?? ''));
    $phone = $phone === '' ? null : mb_substr($phone, 0, 30);

    return ['ok' => true, 'data' => compact('fullName', 'crpNumber', 'phone')];
}

function validateBillingPolicy(array $input): array
{
    $policy = trim((string) ($input['noShowChargePolicy'] ?? ''));
    $policy = $policy === '' ? null : mb_substr($policy, 0, 4000);
    return ['ok' => true, 'data' => ['noShowChargePolicy' => $policy]];
}

function validateReminderPreferences(array $input): array
{
    $channelEmail = (bool) ($input['channelEmail'] ?? false);
    $channelWhatsapp = (bool) ($input['channelWhatsapp'] ?? false);
    $interval7Dias = (bool) ($input['interval7Dias'] ?? false);
    $interval2Dias = (bool) ($input['interval2Dias'] ?? false);
    $interval24Horas = (bool) ($input['interval24Horas'] ?? false);

    if (!$channelEmail && !$channelWhatsapp) {
        return ['ok' => false, 'error' => 'Selecione pelo menos um canal.'];
    }
    if (!$interval7Dias && !$interval2Dias && !$interval24Horas) {
        return ['ok' => false, 'error' => 'Selecione pelo menos um intervalo.'];
    }

    return ['ok' => true, 'data' => compact('channelEmail', 'channelWhatsapp', 'interval7Dias', 'interval2Dias', 'interval24Horas')];
}

function validateSecurity(array $input): array
{
    return ['ok' => true, 'data' => ['twoFactorEnabled' => (bool) ($input['twoFactorEnabled'] ?? false)]];
}

function validateChangePassword(array $input): array
{
    $currentPassword = (string) ($input['currentPassword'] ?? '');
    if ($currentPassword === '') {
        return ['ok' => false, 'error' => 'Informe sua senha atual.'];
    }
    $newPassword = (string) ($input['newPassword'] ?? '');
    if (mb_strlen($newPassword) < 8) {
        return ['ok' => false, 'error' => 'A nova senha deve ter pelo menos 8 caracteres.'];
    }
    $confirmPassword = (string) ($input['confirmPassword'] ?? '');
    if ($confirmPassword === '') {
        return ['ok' => false, 'error' => 'Confirme a nova senha.'];
    }
    if ($newPassword !== $confirmPassword) {
        return ['ok' => false, 'error' => 'As senhas nao coincidem.'];
    }

    return ['ok' => true, 'data' => compact('currentPassword', 'newPassword')];
}

function validateAppearance(array $input): array
{
    $themePreference = (string) ($input['themePreference'] ?? '');
    if (!in_array($themePreference, ['light', 'dark', 'system'], true)) {
        return ['ok' => false, 'error' => 'Tema invalido.'];
    }
    return ['ok' => true, 'data' => compact('themePreference')];
}
