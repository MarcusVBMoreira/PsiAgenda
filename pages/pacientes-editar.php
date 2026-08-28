<?php
declare(strict_types=1);
$pageTitle = 'Editar paciente';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';

$patientId = (string) ($_GET['id'] ?? '');
$patient = dbOne('SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $__user['id']]);
if ($patient === null) {
    http_response_code(404);
    echo '<p class="text-sm text-slate-500 dark:text-slate-400">Paciente nao encontrado.</p>';
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

logAccess($__user['id'], $patient['id'], 'patient', $patient['id'], 'visualizou');

$sessions = dbAll(
    'SELECT id, sequential_number, scheduled_at, status FROM sessions WHERE patient_id = ? AND user_id = ? ORDER BY scheduled_at DESC',
    [$patientId, $__user['id']]
);

require_once __DIR__ . '/../app/icons.php';
const SESSION_STATUS_LABELS_FOR_HISTORY = [
    'livre' => 'Livre', 'pendente' => 'Pendente', 'confirmado' => 'Confirmado',
    'finalizada' => 'Finalizada', 'reagendado' => 'Reagendado',
    'cancelado_cobrado' => 'Cancelado (cobrado)', 'cancelado_sem_cobranca' => 'Cancelado (sem cobranca)',
];
const SESSION_STATUS_BADGE_FOR_HISTORY = [
    'livre' => 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    'pendente' => 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    'confirmado' => 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    'finalizada' => 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'reagendado' => 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'cancelado_cobrado' => 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'cancelado_sem_cobranca' => 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
];
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink(APP_URL . '/pacientes'); ?>
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100"><?= h($patient['full_name']) ?></h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Edite os dados do paciente abaixo.</p>
      </div>
      <a href="<?= h(APP_URL) ?>/pacientes/<?= h($patient['id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
         class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800">
        <?php icon('eye', 'h-4 w-4'); ?>
      </a>
    </div>
  </div>

  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <form id="patient-form" data-patient-id="<?= h($patient['id']) ?>" class="flex flex-col gap-6">
      <?php require __DIR__ . '/../includes/patient-form-fields.php'; ?>
    </form>
  </div>

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
            <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium <?= h(SESSION_STATUS_BADGE_FOR_HISTORY[$s['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h(SESSION_STATUS_LABELS_FOR_HISTORY[$s['status']] ?? $s['status']) ?></span>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/patient-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
