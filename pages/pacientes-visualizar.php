<?php
declare(strict_types=1);
$pageTitle = 'Perfil do paciente';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';
require_once __DIR__ . '/../includes/profile-tabs.php';
require_once __DIR__ . '/../includes/patient-session-history.php';
require_once __DIR__ . '/../app/document_meta.php';

$patientId = (string) ($_GET['id'] ?? '');
$rawTab = (string) ($_GET['tab'] ?? '');
$tab = array_key_exists($rawTab, PROFILE_TABS) ? $rawTab : 'dados-gerais';

$patient = dbOne('SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $__user['id']]);
if ($patient === null) {
    http_response_code(404);
    echo '<p class="text-sm text-slate-500 dark:text-slate-400">Paciente nao encontrado.</p>';
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

logAccess($__user['id'], $patient['id'], 'patient', $patient['id'], 'visualizou');

$sessions = [];
if ($tab === 'sessoes') {
    $sessions = dbAll(
        'SELECT id, sequential_number, scheduled_at, status FROM sessions WHERE patient_id = ? AND user_id = ? ORDER BY scheduled_at DESC',
        [$patientId, $__user['id']]
    );
}

$documents = [];
if ($tab === 'documentos') {
    $documents = dbAll(
        'SELECT id, type, file_url, patient_readable_version, generated_at FROM documents WHERE patient_id = ? ORDER BY generated_at DESC',
        [$patientId]
    );
}
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink(APP_URL . '/pacientes'); ?>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100"><?= h($patient['full_name']) ?></h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Visualizacao somente leitura do paciente.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium <?= h($__PATIENT_STATUS_BADGE_CLASSES[$patient['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h($__PATIENT_STATUS_LABELS[$patient['status']] ?? $patient['status']) ?></span>
        <a href="<?= h(APP_URL) ?>/pacientes/<?= h($patient['id']) ?>" title="Editar paciente" aria-label="Editar paciente"
           class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800">
          <?php icon('pencil', 'h-4 w-4'); ?>
        </a>
      </div>
    </div>
  </div>

  <div class="animate-fade-in-up flex flex-col gap-6">
    <?php renderProfileTabs($patient['id'], $tab); ?>

    <?php if ($tab === 'dados-gerais'): ?>
      <div class="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dados gerais</h2>
          <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <?php infoField('Nome completo', $patient['full_name']); ?>
            <?php infoField('Data de nascimento', $patient['birth_date'] ? formatDateLabel(parseISODate($patient['birth_date'])) : ''); ?>
            <?php infoField('Telefone', $patient['phone']); ?>
            <?php infoField('E-mail', $patient['email']); ?>
            <?php infoField('Frequencia de tratamento', $__FREQUENCY_LABELS[$patient['treatment_frequency']] ?? $patient['treatment_frequency']); ?>
          </div>
        </div>
        <div class="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contato de emergencia</h2>
          <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <?php infoField('Nome', $patient['emergency_contact_name']); ?>
            <?php infoField('Telefone', $patient['emergency_contact_phone']); ?>
          </div>
        </div>
      </div>
    <?php elseif ($tab === 'historico-medico'): ?>
      <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p class="text-xs text-slate-400 dark:text-slate-500">Visivel apenas para voce.</p>
        <div class="grid grid-cols-1 gap-4">
          <?php infoField('Historico medico', $patient['medical_history'], true); ?>
          <?php infoField('Medicacoes em uso', $patient['medications'], true); ?>
        </div>
      </div>
    <?php elseif ($tab === 'sessoes'): ?>
      <?php renderPatientSessionHistory($sessions); ?>
    <?php elseif ($tab === 'documentos'): ?>
      <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Documentos</h2>
            <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500"><?= count($documents) ?> <?= count($documents) === 1 ? 'documento gerado' : 'documentos gerados' ?></p>
          </div>
          <a href="<?= h(APP_URL) ?>/pacientes/<?= h($patient['id']) ?>/documentos/novo" class="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">+ Gerar documento formal</a>
        </div>

        <?php if (count($documents) === 0): ?>
          <p class="text-sm text-slate-500 dark:text-slate-400">Nenhum documento gerado para este paciente ainda.</p>
        <?php else: ?>
          <div class="flex flex-col gap-2">
            <?php foreach ($documents as $doc): ?>
              <div class="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                <div>
                  <p class="font-medium text-slate-900 dark:text-slate-100">
                    <?= h(DOCUMENT_TYPE_LABELS[$doc['type']] ?? $doc['type']) ?>
                    <?php if ($doc['patient_readable_version']): ?>
                      <span class="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">Versao para o paciente</span>
                    <?php endif; ?>
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400"><?= h(formatDateLabel(parseISODate(extractDatePart($doc['generated_at'])))) ?></p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <a href="<?= h(APP_URL) ?>/api/documents/<?= h($doc['id']) ?>/download" title="Baixar" aria-label="Baixar"
                     class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <?php icon('download', 'h-4 w-4'); ?>
                  </a>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
