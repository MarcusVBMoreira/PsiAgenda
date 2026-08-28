<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/config.php';
require_once __DIR__ . '/../app/cron_auth.php';
require_once __DIR__ . '/../app/services/adherence_checker.php';

header('Content-Type: application/json; charset=utf-8');

if (!isAuthorizedCronRequest()) {
    http_response_code(401);
    echo json_encode(['error' => 'Nao autorizado.']);
    exit;
}

$results = runAdherenceChecker();
echo json_encode(array_merge(['ok' => true], $results));
