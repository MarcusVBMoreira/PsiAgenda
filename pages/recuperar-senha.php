<?php
declare(strict_types=1);
$pageTitle = 'Recuperar senha';
require_once __DIR__ . '/../includes/auth-header.php';
?>
<div id="step-solicitar">
  <form id="request-form" class="flex flex-col gap-4">
    <p class="text-sm text-slate-600 dark:text-slate-400">Informe seu e-mail cadastrado para receber um codigo de verificacao.</p>
    <div>
      <label for="req-email" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
      <input type="email" id="req-email" autocomplete="email" required
             class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
    </div>
    <p id="request-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
    <button type="submit" id="request-submit"
            class="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
      Enviar codigo
    </button>
    <p class="text-center text-sm text-slate-600 dark:text-slate-400">
      <a href="<?= h(APP_URL) ?>/login" class="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">Voltar para o login</a>
    </p>
  </form>
</div>

<div id="step-confirmar" class="hidden">
  <form id="confirm-form" class="flex flex-col gap-4">
    <p id="confirm-hint" class="text-sm text-slate-600 dark:text-slate-400"></p>
    <div>
      <label for="confirm-code" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Codigo de verificacao</label>
      <input type="text" id="confirm-code" inputmode="numeric" maxlength="6" required
             class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
    </div>
    <div>
      <label for="confirm-password" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Nova senha</label>
      <input type="password" id="confirm-password" autocomplete="new-password" minlength="8" required
             class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
    </div>
    <p id="confirm-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
    <button type="submit" id="confirm-submit"
            class="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
      Redefinir senha
    </button>
  </form>
</div>

<div id="step-concluido" class="hidden flex-col gap-4 text-center">
  <p class="text-sm text-slate-700 dark:text-slate-300">Senha redefinida com sucesso.</p>
  <a href="<?= h(APP_URL) ?>/login" class="text-sm font-medium text-slate-900 transition-colors hover:underline dark:text-slate-100">Voltar para o login</a>
</div>

<script>
  var emailForConfirm = '';

  document.getElementById('confirm-code').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  document.getElementById('request-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var errorEl = document.getElementById('request-error');
    var submitBtn = document.getElementById('request-submit');
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    emailForConfirm = document.getElementById('req-email').value;

    PsiAgenda.postJSON('/api/recuperar-senha', { email: emailForConfirm }).then(function (res) {
      submitBtn.disabled = false;
      if (!res.ok) {
        errorEl.textContent = res.data.error || 'Nao foi possivel enviar o codigo.';
        errorEl.classList.remove('hidden');
        return;
      }
      document.getElementById('confirm-hint').textContent =
        'Enviamos um codigo de 6 digitos para ' + emailForConfirm + '. Informe-o abaixo junto com a nova senha.';
      document.getElementById('step-solicitar').classList.add('hidden');
      document.getElementById('step-confirmar').classList.remove('hidden');
    }).catch(function () {
      submitBtn.disabled = false;
      errorEl.textContent = 'Erro de conexao. Tente novamente.';
      errorEl.classList.remove('hidden');
    });
  });

  document.getElementById('confirm-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var errorEl = document.getElementById('confirm-error');
    var submitBtn = document.getElementById('confirm-submit');
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;

    PsiAgenda.postJSON('/api/recuperar-senha-confirmar', {
      email: emailForConfirm,
      code: document.getElementById('confirm-code').value,
      newPassword: document.getElementById('confirm-password').value,
    }).then(function (res) {
      submitBtn.disabled = false;
      if (!res.ok) {
        errorEl.textContent = res.data.error || 'Nao foi possivel redefinir a senha.';
        errorEl.classList.remove('hidden');
        return;
      }
      document.getElementById('step-confirmar').classList.add('hidden');
      document.getElementById('step-concluido').classList.remove('hidden');
      document.getElementById('step-concluido').classList.add('flex');
    }).catch(function () {
      submitBtn.disabled = false;
      errorEl.textContent = 'Erro de conexao. Tente novamente.';
      errorEl.classList.remove('hidden');
    });
  });
</script>

<?php require_once __DIR__ . '/../includes/auth-footer.php'; ?>
