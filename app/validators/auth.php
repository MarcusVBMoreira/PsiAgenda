<?php
// Validacao dos formularios de autenticacao, portada de
// src/lib/validators/auth.ts. Cada funcao retorna
// ['ok' => bool, 'error' => ?string, 'data' => array] — mesmo formato
// simples em toda a app, espelhando o padrao zod.safeParse() do Next.js.

declare(strict_types=1);

function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateLogin(array $input): array
{
    $email = trim((string) ($input['email'] ?? ''));
    $password = (string) ($input['password'] ?? '');

    if (!isValidEmail($email)) {
        return ['ok' => false, 'error' => 'E-mail invalido.'];
    }
    if ($password === '') {
        return ['ok' => false, 'error' => 'Informe sua senha.'];
    }

    return ['ok' => true, 'data' => ['email' => $email, 'password' => $password]];
}

function validateCadastro(array $input): array
{
    $fullName = trim((string) ($input['fullName'] ?? ''));
    $crpNumber = trim((string) ($input['crpNumber'] ?? ''));
    $email = trim((string) ($input['email'] ?? ''));
    $password = (string) ($input['password'] ?? '');

    if (mb_strlen($fullName) < 3) {
        return ['ok' => false, 'error' => 'Informe seu nome completo.'];
    }
    if (mb_strlen($crpNumber) < 3) {
        return ['ok' => false, 'error' => 'Informe seu numero de CRP.'];
    }
    if (!isValidEmail($email)) {
        return ['ok' => false, 'error' => 'E-mail invalido.'];
    }
    if (mb_strlen($password) < 8) {
        return ['ok' => false, 'error' => 'A senha deve ter pelo menos 8 caracteres.'];
    }

    return ['ok' => true, 'data' => compact('fullName', 'crpNumber', 'email', 'password')];
}

function validateVerifyCode(array $input): array
{
    $code = trim((string) ($input['code'] ?? ''));
    if (!preg_match('/^\d{6}$/', $code)) {
        return ['ok' => false, 'error' => 'O codigo deve ter 6 digitos.'];
    }
    return ['ok' => true, 'data' => ['code' => $code]];
}

function validateRequestPasswordReset(array $input): array
{
    $email = trim((string) ($input['email'] ?? ''));
    if (!isValidEmail($email)) {
        return ['ok' => false, 'error' => 'E-mail invalido.'];
    }
    return ['ok' => true, 'data' => ['email' => $email]];
}

function validateConfirmPasswordReset(array $input): array
{
    $email = trim((string) ($input['email'] ?? ''));
    $code = trim((string) ($input['code'] ?? ''));
    $newPassword = (string) ($input['newPassword'] ?? '');

    if (!isValidEmail($email)) {
        return ['ok' => false, 'error' => 'E-mail invalido.'];
    }
    if (!preg_match('/^\d{6}$/', $code)) {
        return ['ok' => false, 'error' => 'O codigo deve ter 6 digitos.'];
    }
    if (mb_strlen($newPassword) < 8) {
        return ['ok' => false, 'error' => 'A senha deve ter pelo menos 8 caracteres.'];
    }

    return ['ok' => true, 'data' => compact('email', 'code', 'newPassword')];
}
