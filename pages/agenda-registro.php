<?php
declare(strict_types=1);
$pageTitle = 'Registro de sessao';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';
require_once __DIR__ . '/../app/session_meta.php';

$sessionId = (string) ($_GET['session'] ?? '');
$session = dbOne(
    'SELECT s.*, p.full_name AS patient_name FROM sessions s JOIN patients p ON p.id = s.patient_id WHERE s.id = ? AND s.user_id = ? LIMIT 1',
    [$sessionId, $__user['id']]
);
if ($session === null) {
    http_response_code(404);
    echo '<p class="text-sm text-slate-500 dark:text-slate-400">Agendamento nao encontrado.</p>';
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

$note = dbOne('SELECT * FROM session_notes WHERE session_id = ? LIMIT 1', [$sessionId]);

logAccess($__user['id'], $session['patient_id'], 'session', $session['id'], 'visualizou');

$datePart = extractDatePart($session['scheduled_at']);
$backHref = APP_URL . '/agenda?view=dia&date=' . $datePart;
$canWriteNote = $note !== null || $session['status'] === 'confirmado';
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink($backHref); ?>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Atendimento <?= (int) $session['sequential_number'] ?></p>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100"><?= h($session['patient_name']) ?></h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          <?= h(formatDateLabel(parseISODate($datePart))) ?> as <?= h(extractTimePart($session['scheduled_at'])) ?> &middot;
          <?= h(MODALITY_LABELS[$session['modality']] ?? $session['modality']) ?> &middot; <?= (int) $session['duration_minutes'] ?> min
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium <?= h(STATUS_BADGE_CLASSES[$session['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h(STATUS_LABELS[$session['status']] ?? $session['status']) ?></span>
        <a href="<?= h(APP_URL) ?>/pacientes/<?= h($session['patient_id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
           class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <?php icon('eye', 'h-4 w-4'); ?>
        </a>
      </div>
    </div>
  </div>

  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <?php if ($canWriteNote): ?>
      <form id="session-note-form" data-session-id="<?= h($session['id']) ?>" data-back-href="<?= h($backHref) ?>" class="flex flex-col gap-4">
        <div>
          <label for="keywordSummary" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Palavra-chave / resumo curto</label>
          <input type="text" id="keywordSummary" maxlength="280" required value="<?= h($note['keyword_summary'] ?? '') ?>"
                 placeholder="Ex.: Ansiedade no trabalho, primeira crise relatada"
                 class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>
        <p class="-mt-2 text-xs text-slate-400 dark:text-slate-500">Um gatilho de memoria rapido — nao substitui o relatorio completo abaixo.</p>

        <div>
          <label for="fullReport" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Relatorio completo</label>
          <textarea id="fullReport" rows="10" required placeholder="Descreva o que foi trabalhado na sessao, observacoes clinicas, evolucao do paciente..."
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"><?= h($note['full_report'] ?? '') ?></textarea>
        </div>

        <div>
          <label for="theoreticalReferences" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Referencias teoricas (opcional)</label>
          <textarea id="theoreticalReferences" rows="3" placeholder="Ex.: Terapia Cognitivo-Comportamental, Beck (1979)..."
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"><?= h($note['theoretical_references'] ?? '') ?></textarea>
        </div>

        <p id="session-note-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

        <div class="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <button type="submit" id="session-note-submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">Salvar registro</button>
        </div>
      </form>
    <?php else: ?>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        O registro de sessao so pode ser preenchido apos a sessao ser confirmada. Altere o status do agendamento para &ldquo;Confirmado&rdquo; para liberar o registro.
      </p>
    <?php endif; ?>
  </div>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/session-note-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
