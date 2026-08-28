<?php
declare(strict_types=1);
$pageTitle = 'Criar conta';
require_once __DIR__ . '/../includes/auth-header.php';

if (getCurrentUser() !== null) {
    header('Location: ' . APP_URL . '/dashboard');
    exit;
}

function authField(string $id, string $label, string $type = 'text', array $attrs = []): void
{
    $attrString = '';
    foreach ($attrs as $k => $v) {
        $attrString .= ' ' . h($k) . '="' . h((string) $v) . '"';
    }
    echo '<div><label for="' . h($id) . '" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">' . h($label) . '</label>'
        . '<input type="' . h($type) . '" id="' . h($id) . '" name="' . h($id) . '"' . $attrString
        . ' class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"></div>';
}
?>
<form id="cadastro-form" class="flex flex-col gap-4">
  <?php authField('fullName', 'Nome completo', 'text', ['autocomplete' => 'name', 'required' => 'required']); ?>
  <?php authField('crpNumber', 'CRP', 'text', ['placeholder' => 'Ex.: 06/221237', 'required' => 'required']); ?>
  <?php authField('email', 'E-mail', 'email', ['autocomplete' => 'email', 'required' => 'required']); ?>
  <?php passwordField('password', 'Senha', ['autocomplete' => 'new-password', 'minlength' => '8', 'required' => 'required']); ?>
  <?php passwordField('confirmPassword', 'Confirmar senha', ['autocomplete' => 'new-password', 'minlength' => '8', 'required' => 'required']); ?>

  <p id="cadastro-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

  <button type="submit" id="cadastro-submit"
          class="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
    Criar conta
  </button>

  <p class="text-center text-sm text-slate-600 dark:text-slate-400">
    Ja tem conta? <a href="<?= h(APP_URL) ?>/login" class="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">Entrar</a>
  </p>
</form>

<script>
  document.getElementById('cadastro-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var errorEl = document.getElementById('cadastro-error');
    var submitBtn = document.getElementById('cadastro-submit');
    errorEl.classList.add('hidden');

    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      errorEl.textContent = 'As senhas nao coincidem.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;

    PsiAgenda.postJSON('/api/cadastro', {
      fullName: document.getElementById('fullName').value,
      crpNumber: document.getElementById('crpNumber').value,
      email: document.getElementById('email').value,
      password: password,
    }).then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || 'Nao foi possivel criar a conta.';
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
