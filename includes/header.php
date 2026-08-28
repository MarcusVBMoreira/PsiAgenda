<?php
// Layout do dashboard (nav fixa + tema). Inclua no topo de toda pagina
// autenticada; feche com includes/footer.php. Espera opcionalmente
// $pageTitle (string, usado na tag <title>).

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$__user = requireCurrentUser(); // redireciona pro /login se nao autenticado
$__pageTitle = isset($pageTitle) ? ($pageTitle . ' — PsiAgenda') : 'PsiAgenda';
$__scriptName = basename($_SERVER['SCRIPT_NAME'], '.php');

$__navItems = [
    ['href' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'layout-dashboard'],
    ['href' => 'agenda', 'label' => 'Agenda', 'icon' => 'calendar-days'],
    ['href' => 'pacientes', 'label' => 'Pacientes', 'icon' => 'users'],
    ['href' => 'alertas', 'label' => 'Alertas', 'icon' => 'bell'],
    ['href' => 'configuracoes', 'label' => 'Configuracoes', 'icon' => 'settings'],
];
?>
<!doctype html>
<html lang="pt-BR" class="h-full antialiased">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= h($__pageTitle) ?></title>
<link rel="stylesheet" href="<?= h(APP_URL) ?>/assets/css/app.css">
<script>window.APP_URL = <?= json_encode(APP_URL) ?>; window.CSRF_TOKEN = <?= json_encode(csrfToken()) ?>;</script>
<script>
  // Aplica o tema antes do primeiro paint, pra evitar flash de tema errado.
  (function () {
    var saved = localStorage.getItem('theme');
    var dbDefault = <?= json_encode($__user['themePreference'] ?? 'system') ?>;
    var pref = saved || dbDefault || 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
</head>
<body class="flex min-h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
<header class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
  <div class="flex min-w-0 items-center gap-4 sm:gap-6">
    <a href="<?= h(APP_URL) ?>/dashboard" class="shrink-0 text-lg font-semibold text-slate-900 transition-opacity hover:opacity-80 dark:text-slate-50">PsiAgenda</a>
    <nav class="flex items-center gap-1 text-sm">
      <?php foreach ($__navItems as $item): $active = $__scriptName === $item['href']; ?>
      <a href="<?= h(APP_URL) ?>/<?= h($item['href']) ?>"
         class="group relative flex items-center gap-1.5 rounded-md px-3 py-2 font-medium transition-colors duration-150 <?= $active ? 'text-slate-900 dark:text-slate-50' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100' ?>">
        <?php icon($item['icon'], 'h-4 w-4'); ?>
        <span class="hidden sm:inline"><?= h($item['label']) ?></span>
        <span class="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-slate-900 transition-transform duration-200 ease-out dark:bg-slate-50 <?= $active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50' ?>"></span>
      </a>
      <?php endforeach; ?>
    </nav>
  </div>
  <div class="flex shrink-0 items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
    <span class="hidden max-w-[10rem] truncate sm:inline"><?= h($__user['fullName']) ?></span>
    <button type="button" id="logout-button" class="rounded-md px-3 py-2 font-medium text-slate-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">Sair</button>
  </div>
</header>
<main class="p-4 sm:p-6">
