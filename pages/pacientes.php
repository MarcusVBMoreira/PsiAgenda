<?php
declare(strict_types=1);
$pageTitle = 'Pacientes';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';

$search = trim((string) ($_GET['search'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));

$conditions = ['user_id = ?'];
$params = [$__user['id']];
if ($search !== '') {
    $conditions[] = 'full_name LIKE ?';
    $params[] = '%' . $search . '%';
}
if (in_array($status, ['ativo', 'inativo', 'encerrado'], true)) {
    $conditions[] = 'status = ?';
    $params[] = $status;
}

$patients = dbAll(
    'SELECT id, full_name, phone, email, treatment_frequency, status FROM patients WHERE '
    . implode(' AND ', $conditions) . ' ORDER BY full_name ASC',
    $params
);
?>
<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between animate-fade-in-up">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Pacientes</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400"><?= count($patients) ?> <?= count($patients) === 1 ? 'paciente' : 'pacientes' ?></p>
    </div>
    <a href="<?= h(APP_URL) ?>/pacientes/novo" class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">+ Novo paciente</a>
  </div>

  <form method="get" class="flex flex-wrap gap-3 animate-fade-in-up">
    <input type="text" name="search" placeholder="Buscar por nome" value="<?= h($search) ?>"
           class="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
    <select name="status" class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
      <option value="">Todos os status</option>
      <option value="ativo" <?= $status === 'ativo' ? 'selected' : '' ?>>Ativo</option>
      <option value="inativo" <?= $status === 'inativo' ? 'selected' : '' ?>>Inativo</option>
      <option value="encerrado" <?= $status === 'encerrado' ? 'selected' : '' ?>>Encerrado</option>
    </select>
    <button type="submit" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Filtrar</button>
  </form>

  <div class="animate-fade-in-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <tr>
            <th class="px-4 py-2 font-medium">Nome</th>
            <th class="px-4 py-2 font-medium">Contato</th>
            <th class="px-4 py-2 font-medium">Frequencia</th>
            <th class="px-4 py-2 font-medium">Status</th>
            <th class="px-4 py-2 font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <?php if (count($patients) === 0): ?>
            <tr><td colspan="5" class="px-4 py-6 text-center text-slate-500 dark:text-slate-400">Nenhum paciente encontrado.</td></tr>
          <?php endif; ?>
          <?php foreach ($patients as $patient): ?>
            <tr class="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
              <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100"><?= h($patient['full_name']) ?></td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300"><?= h($patient['email'] ?: ($patient['phone'] ?: '-')) ?></td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300"><?= h($__FREQUENCY_LABELS[$patient['treatment_frequency']] ?? $patient['treatment_frequency']) ?></td>
              <td class="whitespace-nowrap px-4 py-3">
                <span class="rounded-full px-2.5 py-0.5 text-xs font-medium <?= h($__PATIENT_STATUS_BADGE_CLASSES[$patient['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h($__PATIENT_STATUS_LABELS[$patient['status']] ?? $patient['status']) ?></span>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <div class="flex gap-2">
                  <a href="<?= h(APP_URL) ?>/pacientes/<?= h($patient['id']) ?>/visualizar" title="Visualizar paciente" aria-label="Visualizar paciente"
                     class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <?php icon('eye', 'h-4 w-4'); ?>
                  </a>
                  <a href="<?= h(APP_URL) ?>/pacientes/<?= h($patient['id']) ?>" title="Editar paciente" aria-label="Editar paciente"
                     class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800">
                    <?php icon('pencil', 'h-4 w-4'); ?>
                  </a>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
