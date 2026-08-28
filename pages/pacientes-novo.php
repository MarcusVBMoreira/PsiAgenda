<?php
declare(strict_types=1);
$pageTitle = 'Novo paciente';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';

$patient = null;
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink(APP_URL . '/pacientes'); ?>
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo paciente</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Preencha os dados abaixo para adicionar um novo paciente ao seu consultorio.</p>
    </div>
  </div>
  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <form id="patient-form" class="flex flex-col gap-6">
      <?php require __DIR__ . '/../includes/patient-form-fields.php'; ?>
    </form>
  </div>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/patient-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
