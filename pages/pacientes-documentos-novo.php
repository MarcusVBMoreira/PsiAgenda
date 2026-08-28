<?php
declare(strict_types=1);
$pageTitle = 'Novo documento formal';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';
require_once __DIR__ . '/../app/formal_document_templates.php';
require_once __DIR__ . '/../app/document_meta.php';

$patientId = (string) ($_GET['id'] ?? '');
$patient = dbOne('SELECT id, full_name FROM patients WHERE id = ? AND user_id = ? LIMIT 1', [$patientId, $__user['id']]);
if ($patient === null) {
    http_response_code(404);
    echo '<p class="text-sm text-slate-500 dark:text-slate-400">Paciente nao encontrado.</p>';
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

const FORMAL_TYPES = ['laudo', 'atestado', 'declaracao', 'relatorio', 'parecer'];
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink(APP_URL . '/pacientes/' . $patient['id'] . '/visualizar?tab=documentos'); ?>
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo documento formal</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400"><?= h($patient['full_name']) ?></p>
    </div>
  </div>

  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <form id="formal-document-form" data-patient-id="<?= h($patient['id']) ?>" data-patient-name="<?= h($patient['full_name']) ?>" class="flex flex-col gap-4">
      <div>
        <label for="type" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo de documento</label>
        <select id="type" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
          <?php foreach (FORMAL_TYPES as $type): ?>
            <option value="<?= h($type) ?>" <?= $type === 'atestado' ? 'selected' : '' ?>><?= h(DOCUMENT_TYPE_LABELS[$type] ?? $type) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div>
        <label for="title" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Titulo / assunto (opcional)</label>
        <input type="text" id="title" placeholder="Ex.: Solicitacao da escola X"
               class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
      </div>

      <div>
        <label for="body" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Conteudo do documento</label>
        <textarea id="body" rows="16" required
                  class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"></textarea>
      </div>
      <p class="-mt-2 text-xs text-slate-400 dark:text-slate-500">Preenchido com um modelo inicial para o tipo escolhido — edite livremente antes de gerar.</p>

      <p id="formal-document-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

      <div class="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <button type="submit" id="formal-document-submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">Gerar documento</button>
      </div>
    </form>
  </div>
</div>

<script>
  window.FORMAL_DOCUMENT_TEMPLATES = <?= json_encode(FORMAL_DOCUMENT_TEMPLATES, JSON_UNESCAPED_UNICODE) ?>;
</script>
<script src="<?= h(APP_URL) ?>/assets/js/formal-document-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
