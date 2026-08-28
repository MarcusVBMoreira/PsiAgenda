<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../app/session_messaging.php';

$user = requireCurrentUserApi();
$sessionId = (string) ($_GET['id'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

$result = sendReminderNow($sessionId, $user['id']);
if (!$result['ok']) {
    jsonResponse(['error' => $result['error']], 404);
}
if (!$result['email'] && !$result['whatsapp']) {
    jsonResponse(['error' => 'Nenhum canal disponivel: confira os canais habilitados nas Configuracoes e os dados de contato do paciente.'], 400);
}

jsonResponse(['ok' => true, 'email' => $result['email'], 'whatsapp' => $result['whatsapp']]);
