<?php
// Um unico include no topo de toda pagina/endpoint: carrega config, banco,
// sessao/auth, log de acesso, helpers de data/formato e icones.

declare(strict_types=1);

require_once __DIR__ . '/../app/config.php';
require_once __DIR__ . '/../app/db.php';
require_once __DIR__ . '/../app/auth.php';
require_once __DIR__ . '/../app/access_log.php';
require_once __DIR__ . '/../app/date_helpers.php';
require_once __DIR__ . '/../app/format_helpers.php';
require_once __DIR__ . '/../app/icons.php';

startAppSession();
