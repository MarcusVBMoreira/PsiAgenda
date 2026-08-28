<?php
declare(strict_types=1);
$pageTitle = 'Dashboard';
require_once __DIR__ . '/../includes/header.php';

$today = formatISODate(new DateTime());

$todaySessions = dbAll(
    "SELECT s.id, s.scheduled_at, s.duration_minutes, s.modality, s.status,
            p.id AS patient_id, p.full_name AS patient_name
     FROM sessions s
     JOIN patients p ON p.id = s.patient_id
     WHERE s.user_id = ? AND DATE(s.scheduled_at) = ?
     ORDER BY s.scheduled_at ASC",
    [$__user['id'], $today]
);

$adherenceCount = (int) (dbOne(
    "SELECT COUNT(*) AS total FROM adherence_alerts a
     JOIN patients p ON p.id = a.patient_id
     WHERE p.user_id = ? AND a.status = 'pendente'",
    [$__user['id']]
)['total'] ?? 0);

$retentionCount = (int) (dbOne(
    "SELECT COUNT(*) AS total FROM retention_alerts r
     JOIN patients p ON p.id = r.patient_id
     WHERE p.user_id = ?",
    [$__user['id']]
)['total'] ?? 0);

$totalAlerts = $adherenceCount + $retentionCount;
$confirmedToday = 0;
foreach ($todaySessions as $s) {
    if ($s['status'] === 'confirmado' || $s['status'] === 'finalizada') {
        $confirmedToday++;
    }
}

require_once __DIR__ . '/../app/session_meta.php';

$firstName = explode(' ', $__user['fullName'])[0];
?>
<div class="flex flex-col gap-6">
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Ola, <?= h($firstName) ?></h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400"><?= h(formatDateLabel(new DateTime())) ?></p>
  </div>

  <div class="animate-fade-in-up grid grid-cols-1 gap-4 sm:grid-cols-3">
    <a href="<?= h(APP_URL) ?>/agenda/novo" class="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-transform duration-150 group-hover:scale-105 dark:bg-slate-100 dark:text-slate-900"><?php icon('calendar-plus', 'h-5 w-5'); ?></span>
      <div>
        <p class="text-sm font-medium text-slate-900 dark:text-slate-100">Novo agendamento</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Marcar uma sessao</p>
      </div>
    </a>
    <a href="<?= h(APP_URL) ?>/pacientes/novo" class="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white transition-transform duration-150 group-hover:scale-105 dark:bg-slate-100 dark:text-slate-900"><?php icon('user-plus', 'h-5 w-5'); ?></span>
      <div>
        <p class="text-sm font-medium text-slate-900 dark:text-slate-100">Novo paciente</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Cadastrar paciente</p>
      </div>
    </a>
    <a href="<?= h(APP_URL) ?>/alertas" class="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-150 group-hover:scale-105 <?= $totalAlerts > 0 ? 'bg-amber-500' : 'bg-slate-800 dark:bg-slate-100 dark:text-slate-900' ?>"><?php icon('bell', 'h-5 w-5'); ?></span>
      <div>
        <p class="text-sm font-medium text-slate-900 dark:text-slate-100"><?= $totalAlerts ?> <?= $totalAlerts === 1 ? 'alerta ativo' : 'alertas ativos' ?></p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Ver central de alertas</p>
      </div>
    </a>
  </div>

  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sessoes de hoje</h2>
        <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
          <?= count($todaySessions) === 0 ? 'Nenhuma sessao hoje' : "$confirmedToday de " . count($todaySessions) . ' confirmadas ou finalizadas' ?>
        </p>
      </div>
      <a href="<?= h(APP_URL) ?>/agenda?view=dia&date=<?= h($today) ?>" class="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
        Ver na agenda <?php icon('arrow-right', 'h-3.5 w-3.5'); ?>
      </a>
    </div>

    <?php if (count($todaySessions) === 0): ?>
      <p class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Nenhuma sessao agendada para hoje.</p>
    <?php else: ?>
      <div class="flex flex-col gap-2">
        <?php foreach ($todaySessions as $session): ?>
          <div class="group relative flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">
            <a href="<?= h(APP_URL) ?>/agenda?view=dia&date=<?= h($today) ?>&session=<?= h($session['id']) ?>" class="absolute inset-0" aria-label="Abrir sessao de <?= h($session['patient_name']) ?>"></a>
            <div class="flex items-center gap-3">
              <span class="w-12 shrink-0 font-medium text-slate-700 dark:text-slate-200"><?= h(extractTimePart($session['scheduled_at'])) ?></span>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100"><?= h($session['patient_name']) ?></p>
                <p class="text-xs text-slate-500 dark:text-slate-400"><?= h(MODALITY_LABELS[$session['modality']] ?? $session['modality']) ?> &middot; <?= (int) $session['duration_minutes'] ?> min</p>
              </div>
            </div>
            <div class="relative z-10 flex shrink-0 items-center gap-2">
              <span class="rounded-full px-2.5 py-0.5 text-xs font-medium <?= h(STATUS_BADGE_CLASSES[$session['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h(STATUS_LABELS[$session['status']] ?? $session['status']) ?></span>
              <a href="<?= h(APP_URL) ?>/pacientes/<?= h($session['patient_id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
                 class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                <?php icon('eye', 'h-4 w-4'); ?>
              </a>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
