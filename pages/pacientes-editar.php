<?php
declare(strict_types=1);
$pageTitle = 'Editar paciente';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';
require_once __DIR__ . '/../includes/patient-session-history.php';

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

  <?php renderPatientSessionHistory($sessions); ?>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/patient-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
