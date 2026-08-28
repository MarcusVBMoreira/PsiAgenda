<?php
declare(strict_types=1);
$pageTitle = 'Novo agendamento';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/ui.php';

$patients = dbAll('SELECT id, full_name FROM patients WHERE user_id = ? ORDER BY full_name ASC', [$__user['id']]);
$defaultDate = (string) ($_GET['date'] ?? '');
$defaultPatientId = (string) ($_GET['patientId'] ?? '');
$leadOptions = ['padrao' => 'Usar padrao', 'sim' => 'Sempre enviar', 'nao' => 'Nunca enviar'];
?>
<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
  <div class="flex flex-col gap-3 animate-fade-in-up">
    <?php backLink(APP_URL . '/agenda'); ?>
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Novo agendamento</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Marque uma nova sessao para um paciente.</p>
    </div>
  </div>

  <div class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <?php if (count($patients) === 0): ?>
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Voce ainda nao tem pacientes cadastrados.
        <a href="<?= h(APP_URL) ?>/pacientes/novo" class="font-medium text-slate-900 hover:underline dark:text-slate-100">Cadastre um paciente</a>
        para poder agendar sessoes.
      </p>
    <?php else: ?>
      <form id="new-session-form" class="flex flex-col gap-4">
        <div>
          <label for="patientId" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Paciente</label>
          <select id="patientId" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
            <?php foreach ($patients as $p): ?>
              <option value="<?= h($p['id']) ?>" <?= $p['id'] === $defaultPatientId ? 'selected' : '' ?>><?= h($p['full_name']) ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <div>
          <label for="scheduledAt" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Data e horario</label>
          <input type="datetime-local" id="scheduledAt" required value="<?= $defaultDate !== '' ? h($defaultDate) . 'T09:00' : '' ?>"
                 class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>

        <div>
          <label for="durationMinutes" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Duracao (minutos)</label>
          <input type="number" id="durationMinutes" min="5" max="480" required value="50"
                 class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>

        <div>
          <label for="modality" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Modalidade</label>
          <select id="modality" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div id="platformLink-wrap" class="hidden">
          <label for="platformLink" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Link da plataforma</label>
          <input type="text" id="platformLink" placeholder="https://meet.google.com/..."
                 class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>

        <div>
          <label for="status" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <select id="status" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
            <option value="livre">Livre</option>
            <option value="pendente" selected>Pendente</option>
            <option value="confirmado">Confirmado</option>
          </select>
        </div>

        <div class="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" id="sendConfirmation" checked class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
            Enviar confirmacao automatica quando a sessao for confirmada
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" id="sendReminders" checked class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
            Enviar lembretes automaticos para esta sessao
          </label>
          <p class="text-xs text-slate-400 dark:text-slate-500">Depende tambem do paciente estar habilitado para lembretes nas configuracoes do paciente.</p>

          <div class="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Antecedencia dos lembretes para esta sessao</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label for="reminderLead7Dias" class="mb-1 block text-xs text-slate-500 dark:text-slate-400">7 dias antes</label>
                <select id="reminderLead7Dias" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <?php foreach ($leadOptions as $v => $l): ?><option value="<?= h($v) ?>"><?= h($l) ?></option><?php endforeach; ?>
                </select>
              </div>
              <div>
                <label for="reminderLead2Dias" class="mb-1 block text-xs text-slate-500 dark:text-slate-400">2 dias antes</label>
                <select id="reminderLead2Dias" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <?php foreach ($leadOptions as $v => $l): ?><option value="<?= h($v) ?>"><?= h($l) ?></option><?php endforeach; ?>
                </select>
              </div>
              <div>
                <label for="reminderLead24Horas" class="mb-1 block text-xs text-slate-500 dark:text-slate-400">24 horas antes</label>
                <select id="reminderLead24Horas" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <?php foreach ($leadOptions as $v => $l): ?><option value="<?= h($v) ?>"><?= h($l) ?></option><?php endforeach; ?>
                </select>
              </div>
            </div>
          </div>
        </div>

        <p id="new-session-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

        <div class="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <button type="submit" id="new-session-submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">Cadastrar agendamento</button>
          <a href="<?= h(APP_URL) ?>/agenda" class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</a>
        </div>
      </form>
    <?php endif; ?>
  </div>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/new-session-form.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
