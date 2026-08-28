<?php
// Roda todas as migrations (.sql) desta pasta, em ordem, contra o banco
// configurado em .env. Idempotente: toda migration usa IF NOT EXISTS /
// MODIFY COLUMN, entao rodar de novo nao quebra nada.
//
// Uso: php migrations/run.php   (local, via XAMPP)
//   ou via o terminal do Node.js App / SSH no servidor.

declare(strict_types=1);

require_once __DIR__ . '/../app/config.php';

$host = env('DB_HOST', '127.0.0.1');
$port = env('DB_PORT', '3306');
$name = env('DB_NAME', 'psiagenda');
$user = env('DB_USER', 'root');
$pass = env('DB_PASSWORD', '');

$pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
]);

$pdo->exec("CREATE DATABASE IF NOT EXISTS `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE `$name`");

$files = glob(__DIR__ . '/*.sql');
sort($files);

foreach ($files as $file) {
    $basename = basename($file);
    echo "Aplicando migration: $basename\n";
    $sql = file_get_contents($file);
    $pdo->exec($sql);
}

echo "Migrations aplicadas com sucesso.\n";
