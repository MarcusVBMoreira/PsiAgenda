<?php
declare(strict_types=1);
$pageTitle = 'Configuracoes';
require_once __DIR__ . '/../includes/header.php';

$dbUser = dbOne('SELECT * FROM users WHERE id = ? LIMIT 1', [$__user['id']]);

const ACCESS_ACTION_LABELS = ['visualizou' => 'Visualizou', 'criou' => 'Criou', 'editou' => 'Editou', 'excluiu' => 'Excluiu'];

$accessLogs = dbAll(
    'SELECT record_type, action, created_at FROM access_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
    [$__user['id']]
);
?>
<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Configuracoes</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Perfil, aparencia, cobranca por falta, lembretes e seguranca da sua conta.</p>
  </div>

  <section class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Aparencia</h2>
    <div class="flex gap-2">
      <?php foreach (['light' => 'Claro', 'dark' => 'Escuro', 'system' => 'Sistema'] as $value => $label): $active = ($dbUser['theme_preference'] ?? 'system') === $value; ?>
        <button type="button" data-theme-option="<?= h($value) ?>"
                class="theme-option-btn rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 <?= $active ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800' ?>"><?= h($label) ?></button>
      <?php endforeach; ?>
    </div>
    <p id="appearance-feedback" class="mt-2 hidden text-sm text-green-600 dark:text-green-400">Preferencia salva.</p>
  </section>

  <section class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Perfil do profissional</h2>
    <form id="profile-form" class="flex flex-col gap-4">
      <div>
        <label for="profile-fullName" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Nome completo</label>
        <input type="text" id="profile-fullName" value="<?= h($dbUser['full_name']) ?>" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
        <input type="email" value="<?= h($dbUser['email']) ?>" disabled class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
      </div>
      <div>
        <label for="profile-crpNumber" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">CRP</label>
        <input type="text" id="profile-crpNumber" value="<?= h($dbUser['crp_number']) ?>" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      </div>
      <div>
        <label for="profile-phone" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</label>
        <input type="tel" id="profile-phone" value="<?= h($dbUser['phone'] ?? '') ?>" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      </div>
      <p id="profile-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
      <p id="profile-success" class="hidden text-sm text-green-600 dark:text-green-400">Perfil atualizado.</p>
      <div><button type="submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">Salvar perfil</button></div>
    </form>
  </section>

  <section class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Politica de cobranca por falta</h2>
    <form id="billing-form" class="flex flex-col gap-4">
      <textarea id="billing-policy" rows="4" placeholder="Ex.: Cancelamentos com menos de 24h de antecedencia sao cobrados integralmente."
                class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><?= h($dbUser['no_show_charge_policy'] ?? '') ?></textarea>
      <p id="billing-success" class="hidden text-sm text-green-600 dark:text-green-400">Politica salva.</p>
      <div><button type="submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">Salvar politica</button></div>
    </form>
  </section>

  <section class="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <h2 class="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Confirmacao e lembretes de sessao</h2>
    <div class="mb-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
      <p><span class="font-medium text-slate-600 dark:text-slate-300">Confirmacao:</span> enviada automaticamente no instante em que voce marca uma sessao como "confirmado" (nao tem antecedencia). Pode ser desligada por paciente ou por sessao, e reenviada manualmente pelo painel da sessao na agenda.</p>
      <p><span class="font-medium text-slate-600 dark:text-slate-300">Lembrete:</span> enviado nas antecedencias marcadas abaixo (padrao para todos os seus pacientes). Personalize a antecedencia para um paciente especifico na tela de edicao dele, ou so para uma sessao no painel da agenda.</p>
    </div>
    <form id="reminders-form" class="flex flex-col gap-5">
      <div>
        <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Quando enviar</p>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="interval7Dias" <?= $dbUser['reminder_interval_7_dias'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"> 7 dias antes da sessao</label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="interval2Dias" <?= $dbUser['reminder_interval_2_dias'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"> 2 dias antes da sessao</label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="interval24Horas" <?= $dbUser['reminder_interval_24_horas'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"> 24 horas antes da sessao</label>
        </div>
      </div>
      <div>
        <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Canal de envio</p>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="channelEmail" <?= $dbUser['reminder_channel_email'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"> E-mail</label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="channelWhatsapp" <?= $dbUser['reminder_channel_whatsapp'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"> WhatsApp</label>
        </div>
      </div>
      <p id="reminders-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
      <p id="reminders-success" class="hidden text-sm text-green-600 dark:text-green-400">Preferencias salvas.</p>
      <div><button type="submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">Salvar preferencias</button></div>
    </form>
  </section>

  <section class="animate-fade-in-up flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div>
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seguranca</h2>
      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" id="twoFactorEnabled" <?= $dbUser['two_factor_enabled'] ? 'checked' : '' ?> class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
        Exigir codigo por e-mail (2FA) ao entrar
      </label>
      <p id="security-success" class="mt-2 hidden text-sm text-green-600 dark:text-green-400">Preferencia salva.</p>
    </div>

    <div class="border-t border-slate-100 pt-6 dark:border-slate-800">
      <p class="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">Alterar senha</p>
      <form id="password-form" class="flex flex-col gap-3">
        <input type="password" id="currentPassword" placeholder="Senha atual" autocomplete="current-password" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <input type="password" id="newPassword" placeholder="Nova senha" autocomplete="new-password" minlength="8" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <input type="password" id="confirmPassword" placeholder="Confirmar nova senha" autocomplete="new-password" minlength="8" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <p id="password-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
        <p id="password-success" class="hidden text-sm text-green-600 dark:text-green-400">Senha alterada.</p>
        <div><button type="submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">Alterar senha</button></div>
      </form>
    </div>

    <div class="border-t border-slate-100 pt-6 dark:border-slate-800">
      <p class="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Log de acesso recente</p>
      <?php if (count($accessLogs) === 0): ?>
        <p class="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade registrada ainda.</p>
      <?php else: ?>
        <div class="flex flex-col gap-1.5">
          <?php foreach ($accessLogs as $log): ?>
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span><?= h(ACCESS_ACTION_LABELS[$log['action']] ?? $log['action']) ?> &middot; <?= h($log['record_type']) ?></span>
              <span><?= h(formatDateLabel(parseISODate(extractDatePart($log['created_at'])))) ?> as <?= h(extractTimePart($log['created_at'])) ?></span>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </section>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/settings-forms.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
