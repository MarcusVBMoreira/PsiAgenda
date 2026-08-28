<?php
// Sessao nativa do PHP no lugar do JWT+cookie manual da versao Next.js.
// password_hash()/password_verify() (bcrypt embutido) no lugar do pacote
// bcrypt (que exigia compilacao nativa — um dos motivos da troca de stack).

declare(strict_types=1);

require_once __DIR__ . '/db.php';

const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7; // 7 dias, igual ao JWT_EXPIRES_IN default
const PENDING_2FA_LIFETIME_SECONDS = 60 * 10;       // 10 minutos

function startAppSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME_SECONDS,
        'path' => '/',
        'secure' => (env('APP_URL', '') !== '' && str_starts_with(env('APP_URL', ''), 'https://')),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('psiagenda_php_session');

    // Se um cookie externo (ex.: de testes anteriores com outra stack, ou
    // qualquer valor corrompido) nao for um ID de sessao PHP valido, ignora
    // e comeca uma sessao nova em vez de deixar o session_start() falhar.
    $cookieName = session_name();
    if (isset($_COOKIE[$cookieName]) && !preg_match('/^[A-Za-z0-9,\-]{22,250}$/', $_COOKIE[$cookieName])) {
        unset($_COOKIE[$cookieName]);
        setcookie($cookieName, '', time() - 3600, '/');
    }

    session_start();
}

function hashPassword(string $password): string
{
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

/** Cria a sessao autenticada completa (login concluido). */
function createSession(string $userId): void
{
    startAppSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['login_at'] = time();
    unset($_SESSION['pending_2fa_user_id'], $_SESSION['pending_2fa_until']);
}

/** Marca que o usuario passou email+senha mas ainda precisa do codigo 2FA. */
function createPending2FA(string $userId): void
{
    startAppSession();
    $_SESSION['pending_2fa_user_id'] = $userId;
    $_SESSION['pending_2fa_until'] = time() + PENDING_2FA_LIFETIME_SECONDS;
}

/** Le (sem consumir) o usuario pendente de 2FA, se ainda dentro da validade. */
function pendingTwoFactorUserId(): ?string
{
    startAppSession();
    $userId = $_SESSION['pending_2fa_user_id'] ?? null;
    $until = $_SESSION['pending_2fa_until'] ?? 0;
    if ($userId === null || time() > $until) {
        return null;
    }
    return $userId;
}

function clearPending2FA(): void
{
    startAppSession();
    unset($_SESSION['pending_2fa_user_id'], $_SESSION['pending_2fa_until']);
}

function destroySession(): void
{
    startAppSession();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

/**
 * Usuario autenticado atual, ou null. Formato espelha o SessionUser da
 * versao Next.js (mesmos campos, mesmas chaves em camelCase).
 */
function getCurrentUser(): ?array
{
    startAppSession();
    $userId = $_SESSION['user_id'] ?? null;
    if ($userId === null) {
        return null;
    }

    $row = dbOne(
        'SELECT id, full_name, email, crp_number, two_factor_enabled, theme_preference FROM users WHERE id = ? LIMIT 1',
        [$userId]
    );
    if ($row === null) {
        return null;
    }

    return [
        'id' => $row['id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'crpNumber' => $row['crp_number'],
        'twoFactorEnabled' => (bool) $row['two_factor_enabled'],
        'themePreference' => $row['theme_preference'],
    ];
}

/** Usado nas paginas (pages/*.php): redireciona pro login se nao autenticado. */
function requireCurrentUser(): array
{
    $user = getCurrentUser();
    if ($user === null) {
        header('Location: ' . APP_URL . '/login');
        exit;
    }
    return $user;
}

/** Usado nos endpoints JSON (api/*.php): responde 401 se nao autenticado. */
function requireCurrentUserApi(): array
{
    $user = getCurrentUser();
    if ($user === null) {
        jsonResponse(['error' => 'Nao autenticado.'], 401);
    }
    return $user;
}

/** Token CSRF por sessao, usado em todo POST/PUT/DELETE que muda dado. */
function csrfToken(): string
{
    startAppSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function requireValidCsrfApi(): void
{
    startAppSession();
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || !hash_equals($expected, $sent)) {
        jsonResponse(['error' => 'Token CSRF invalido.'], 403);
    }
}

/** Encerra a resposta atual como JSON, com o status HTTP dado. */
function jsonResponse(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
