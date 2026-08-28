<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/auth.php';
require_once __DIR__ . '/../app/verification_codes.php';
require_once __DIR__ . '/../app/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateRequestPasswordReset($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}

$user = dbOne('SELECT id FROM users WHERE email = ? LIMIT 1', [$parsed['data']['email']]);
if ($user) {
    $code = createVerificationCode($user['id'], 'recuperacao_senha');
    try {
        sendPasswordResetCodeEmail($parsed['data']['email'], $code);
    } catch (MailSendException $e) {
        jsonResponse(['error' => $e->getMessage()], 502);
    }
}

// Resposta identica exista ou nao o e-mail, pra nao expor quais contas existem.
jsonResponse(['ok' => true]);
