<?php
// Campos do formulario de paciente, reaproveitados entre pacientes-novo.php
// e pacientes-editar.php. Espera $patient (array com as chaves do banco,
// ou null para um paciente novo) ja definido no escopo de quem inclui.

declare(strict_types=1);

$p = $patient ?? [];
$val = fn(string $key, $default = '') => h((string) ($p[$key] ?? $default));

function formSelect(string $id, string $label, array $options, string $selected): void
{
    echo '<div><label for="' . h($id) . '" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">' . h($label) . '</label>'
        . '<select id="' . h($id) . '" name="' . h($id) . '" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">';
    foreach ($options as $value => $label2) {
        $sel = $value === $selected ? ' selected' : '';
        echo '<option value="' . h($value) . '"' . $sel . '>' . h($label2) . '</option>';
    }
    echo '</select></div>';
}

function formField(string $id, string $label, string $value, string $type = 'text', array $attrs = []): void
{
    $attrString = '';
    foreach ($attrs as $k => $v) {
        $attrString .= ' ' . h($k) . '="' . h((string) $v) . '"';
    }
    echo '<div><label for="' . h($id) . '" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">' . h($label) . '</label>'
        . '<input type="' . h($type) . '" id="' . h($id) . '" name="' . h($id) . '" value="' . h($value) . '"' . $attrString
        . ' class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400"></div>';
}

function formTextArea(string $id, string $label, string $value, int $rows = 3): void
{
    echo '<div class="sm:col-span-2"><label for="' . h($id) . '" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">' . h($label) . '</label>'
        . '<textarea id="' . h($id) . '" name="' . h($id) . '" rows="' . $rows . '" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">' . h($value) . '</textarea></div>';
}

$leadOptions = ['padrao' => 'Usar padrao do profissional', 'sim' => 'Sempre enviar', 'nao' => 'Nunca enviar'];
?>
<section class="flex flex-col gap-4">
  <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dados gerais</h2>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <?php formField('fullName', 'Nome completo', $val('full_name'), 'text', ['placeholder' => 'Ex.: Maria da Silva', 'required' => 'required']); ?>
    <?php formField('birthDate', 'Data de nascimento', $val('birth_date'), 'date'); ?>
    <?php formField('phone', 'Telefone', $val('phone'), 'tel', ['placeholder' => '(11) 91234-5678', 'maxlength' => '15']); ?>
    <?php formField('email', 'E-mail', $val('email'), 'email', ['placeholder' => 'Ex.: maria@email.com']); ?>
    <?php formSelect('treatmentFrequency', 'Frequencia de tratamento', ['semanal' => 'Semanal', 'quinzenal' => 'Quinzenal', 'mensal' => 'Mensal', 'outro' => 'Outro'], (string) ($p['treatment_frequency'] ?? 'semanal')); ?>
    <?php formSelect('status', 'Status', ['ativo' => 'Ativo', 'inativo' => 'Inativo', 'encerrado' => 'Encerrado'], (string) ($p['status'] ?? 'ativo')); ?>
  </div>
</section>

<section class="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
  <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contato de emergencia</h2>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <?php formField('emergencyContactName', 'Nome', $val('emergency_contact_name'), 'text', ['placeholder' => 'Ex.: Joao da Silva']); ?>
    <?php formField('emergencyContactPhone', 'Telefone', $val('emergency_contact_phone'), 'tel', ['placeholder' => '(11) 91234-5678', 'maxlength' => '15']); ?>
  </div>
</section>

<section class="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
  <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Informacoes clinicas</h2>
  <p class="text-xs text-slate-400 dark:text-slate-500">Visivel apenas para voce.</p>
  <div class="grid grid-cols-1 gap-4">
    <?php formTextArea('medicalHistory', 'Historico medico', $val('medical_history'), 4); ?>
    <?php formTextArea('medications', 'Medicacoes em uso', $val('medications'), 3); ?>
  </div>
</section>

<section class="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
  <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Comunicacao com o paciente</h2>
  <p class="text-xs text-slate-400 dark:text-slate-500">Controla os lembretes e confirmacoes automaticos deste paciente.</p>
  <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
    <input type="checkbox" id="remindersEnabled" name="remindersEnabled" <?= empty($p) || !empty($p['reminders_enabled']) ? 'checked' : '' ?>
           class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
    Enviar lembretes e confirmacoes automaticos para este paciente
  </label>
  <p class="text-xs text-slate-400 dark:text-slate-500">
    Desmarcar aqui bloqueia envios automaticos para todas as sessoes deste paciente, mesmo que a sessao individual permita.
  </p>

  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Antecedencia dos lembretes para este paciente</p>
  <p class="text-xs text-slate-400 dark:text-slate-500">Substitui, so para este paciente, o padrao definido em Configuracoes &gt; Preferencias de lembretes.</p>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <?php formSelect('reminderLead7Dias', '7 dias antes', $leadOptions, (string) ($p['reminder_lead_7_dias'] ?? 'padrao')); ?>
    <?php formSelect('reminderLead2Dias', '2 dias antes', $leadOptions, (string) ($p['reminder_lead_2_dias'] ?? 'padrao')); ?>
    <?php formSelect('reminderLead24Horas', '24 horas antes', $leadOptions, (string) ($p['reminder_lead_24_horas'] ?? 'padrao')); ?>
  </div>
</section>

<p id="patient-form-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

<div class="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
  <button type="submit" id="patient-form-submit" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
    <?= empty($p) ? 'Cadastrar paciente' : 'Salvar alteracoes' ?>
  </button>
  <a href="<?= h(APP_URL) ?>/pacientes" class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</a>
</div>
