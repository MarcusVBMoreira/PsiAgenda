<?php
// Layout centralizado das paginas publicas de autenticacao (login, cadastro,
// verificar 2FA, recuperar senha). Nao exige usuario logado. Espera
// opcionalmente $pageTitle.

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$__pageTitle = isset($pageTitle) ? ($pageTitle . ' — PsiAgenda') : 'PsiAgenda';
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
  (function () {
    var saved = localStorage.getItem('theme');
    var pref = saved || 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
</head>
<body class="flex min-h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
  <div class="animate-scale-in w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <h1 class="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-slate-100">PsiAgenda</h1>
