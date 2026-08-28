<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/validators/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$parsed = validateCadastro($body);
if (!$parsed['ok']) {
    jsonResponse(['error' => $parsed['error']], 400);
}
$data = $parsed['data'];

$existing = dbOne('SELECT id FROM users WHERE email = ? LIMIT 1', [$data['email']]);
if ($existing) {
    jsonResponse(['error' => 'Ja existe uma conta com este e-mail.'], 409);
}

$id = uuid();
$passwordHash = hashPassword($data['password']);

dbExec(
    'INSERT INTO users (id, full_name, email, password_hash, crp_number, two_factor_enabled) VALUES (?, ?, ?, ?, ?, FALSE)',
    [$id, $data['fullName'], $data['email'], $passwordHash, $data['crpNumber']]
);

createSession($id);
jsonResponse(['ok' => true]);
