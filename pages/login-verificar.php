<?php
declare(strict_types=1);
$pageTitle = 'Verificar codigo';
require_once __DIR__ . '/../includes/auth-header.php';
?>
<form id="verify-form" class="flex flex-col gap-4">
  <p class="text-sm text-slate-600 dark:text-slate-400">
    Enviamos um codigo de 6 digitos para o seu e-mail. Ele expira em 10 minutos.
  </p>
  <div>
    <label for="code" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Codigo de verificacao</label>
    <input type="text" id="code" name="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required
           class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
  </div>

  <p id="verify-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

  <button type="submit" id="verify-submit"
          class="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
    Confirmar
  </button>
</form>

<script>
  document.getElementById('code').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  document.getElementById('verify-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var errorEl = document.getElementById('verify-error');
    var submitBtn = document.getElementById('verify-submit');
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;

    PsiAgenda.postJSON('/api/2fa', { code: document.getElementById('code').value }).then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || 'Codigo invalido.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        return;
      }
      window.location.href = window.APP_URL + '/dashboard';
    }).catch(function () {
      errorEl.textContent = 'Erro de conexao. Tente novamente.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
    });
  });
</script>

<?php require_once __DIR__ . '/../includes/auth-footer.php'; ?>
