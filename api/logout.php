<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Metodo nao permitido.'], 405);
}
requireValidCsrfApi();

destroySession();
jsonResponse(['ok' => true]);
