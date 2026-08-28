<?php
declare(strict_types=1);
$pageTitle = 'Entrar';
require_once __DIR__ . '/../includes/auth-header.php';

// Se ja estiver logado, nao faz sentido ver a tela de login.
if (getCurrentUser() !== null) {
    header('Location: ' . APP_URL . '/dashboard');
    exit;
}
?>
<form id="login-form" class="flex flex-col gap-4">
  <div>
    <label for="email" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
    <input type="email" id="email" name="email" autocomplete="email" required
           class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
  </div>
  <?php passwordField('password', 'Senha', ['autocomplete' => 'current-password', 'required' => 'required']); ?>

  <p id="login-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

  <button type="submit" id="login-submit"
          class="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
    Entrar
  </button>

  <div class="flex justify-between text-sm text-slate-600 dark:text-slate-400">
    <a href="<?= h(APP_URL) ?>/recuperar-senha" class="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">Esqueci minha senha</a>
    <a href="<?= h(APP_URL) ?>/cadastro" class="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">Criar conta</a>
  </div>
</form>

<script>
  document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var errorEl = document.getElementById('login-error');
    var submitBtn = document.getElementById('login-submit');
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;

    PsiAgenda.postJSON('/api/login', {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }).then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || 'Nao foi possivel entrar.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        return;
      }
      window.location.href = window.APP_URL + (res.data.requires2FA ? '/login/verificar' : '/dashboard');
    }).catch(function () {
      errorEl.textContent = 'Erro de conexao. Tente novamente.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
    });
  });
</script>

<?php require_once __DIR__ . '/../includes/auth-footer.php'; ?>
