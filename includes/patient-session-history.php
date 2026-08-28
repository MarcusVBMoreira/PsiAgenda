<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/session_meta.php';

function renderPatientSessionHistory(array $sessions): void
{
    ?>
    <div class="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Historico de sessoes</h2>
        <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500"><?= count($sessions) ?> <?= count($sessions) === 1 ? 'sessao registrada' : 'sessoes registradas' ?></p>
      </div>
      <?php if (count($sessions) === 0): ?>
        <p class="text-sm text-slate-500 dark:text-slate-400">Nenhuma sessao agendada para este paciente ainda.</p>
      <?php else: ?>
        <div class="flex flex-col gap-2">
          <?php foreach ($sessions as $s): $datePart = extractDatePart($s['scheduled_at']); $isFinalizada = $s['status'] === 'finalizada';
            $href = $isFinalizada ? (APP_URL . '/agenda/' . $s['id'] . '/registro') : (APP_URL . '/agenda?view=dia&date=' . $datePart . '&session=' . $s['id']); ?>
            <a href="<?= h($href) ?>" class="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100">Atendimento <?= (int) $s['sequential_number'] ?></p>
                <p class="text-xs text-slate-500 dark:text-slate-400"><?= h(formatDateLabel(parseISODate($datePart))) ?> as <?= h(extractTimePart($s['scheduled_at'])) ?><?= $isFinalizada ? ' &middot; ver registro' : '' ?></p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium <?= h(STATUS_BADGE_CLASSES[$s['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h(STATUS_LABELS[$s['status']] ?? $s['status']) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
    <?php
}
