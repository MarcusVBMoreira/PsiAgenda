<?php
// Codigos de verificacao (2FA e recuperacao de senha), portado de
// src/lib/verification-codes.ts.

declare(strict_types=1);

require_once __DIR__ . '/db.php';

const CODE_TTL_MINUTES = 10;

function generateNumericCode(): string
{
    return (string) random_int(100000, 999999);
}

/** Gera, salva (hasheado) e retorna um codigo de 6 digitos para o usuario. */
function createVerificationCode(string $userId, string $type): string
{
    $code = generateNumericCode();
    $codeHash = password_hash($code, PASSWORD_BCRYPT, ['cost' => 10]);
    $expiresAt = (new DateTime('+' . CODE_TTL_MINUTES . ' minutes'))->format('Y-m-d H:i:s');

    dbExec(
        'INSERT INTO verification_codes (id, user_id, code_hash, type, expires_at, used) VALUES (?, ?, ?, ?, ?, FALSE)',
        [uuid(), $userId, $codeHash, $type, $expiresAt]
    );

    return $code;
}

/** Confirma o codigo e o marca como usado (nao pode ser reaproveitado). */
function verifyAndConsumeCode(string $userId, string $type, string $code): bool
{
    $rows = dbAll(
        'SELECT id, code_hash, expires_at, used FROM verification_codes
         WHERE user_id = ? AND type = ? AND used = FALSE
         ORDER BY created_at DESC LIMIT 5',
        [$userId, $type]
    );

    $now = new DateTime();
    foreach ($rows as $row) {
        if (new DateTime($row['expires_at']) < $now) {
            continue;
        }
        if (password_verify($code, $row['code_hash'])) {
            dbExec('UPDATE verification_codes SET used = TRUE WHERE id = ?', [$row['id']]);
            return true;
        }
    }

    return false;
}
