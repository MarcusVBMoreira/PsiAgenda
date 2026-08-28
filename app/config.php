<?php
// Carrega variaveis de ambiente de um arquivo .env na raiz do projeto (formato
// KEY=VALUE, uma por linha, # para comentario) e as expoe via env(). Nao usa
// nenhuma biblioteca externa — e um parser minimo, chamado uma unica vez.

declare(strict_types=1);

function loadEnvFile(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Remove aspas simples ou duplas envolvendo o valor, se houver.
        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        if (getenv($key) === false) {
            putenv("$key=$value");
        }
        $_ENV[$key] = $value;
    }
}

loadEnvFile(__DIR__ . '/../.env');

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }
    return $value;
}

function envBool(string $key, bool $default = false): bool
{
    $value = env($key);
    if ($value === null) {
        return $default;
    }
    return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
}

// Fuso horario fixo — datas de sessao/lembrete sao sempre tratadas em horario
// local do Brasil, sem componente de timezone no banco (igual a versao Next.js).
date_default_timezone_set('America/Sao_Paulo');

define('APP_URL', env('APP_URL', 'http://localhost/PsiAgenda'));
define('CRON_SECRET', env('CRON_SECRET', ''));
