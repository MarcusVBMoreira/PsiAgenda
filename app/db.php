<?php
// Conexao PDO unica (singleton simples) + helpers finos para deixar o padrao
// "query com parametros" tao direto quanto o pool.query() do mysql2 na
// versao Next.js. Todo acesso a banco do app passa por aqui.

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $name = env('DB_NAME', 'psiagenda');
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASSWORD', '');

    $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

/** Retorna todas as linhas de uma consulta. */
function dbAll(string $sql, array $params = []): array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/** Retorna a primeira linha de uma consulta, ou null se nao houver nenhuma. */
function dbOne(string $sql, array $params = []): ?array
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

/** Executa um INSERT/UPDATE/DELETE. Retorna o numero de linhas afetadas. */
function dbExec(string $sql, array $params = []): int
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}

/** UUID v4, equivalente ao crypto.randomUUID() usado na versao Next.js. */
function uuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
