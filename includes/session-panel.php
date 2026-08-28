<?php
// Estrutura (fechada por padrao) do painel lateral de sessao. O conteudo e
// preenchido via JS (assets/js/session-panel.js) a partir de
// GET /api/sessions/{id}, disparado quando a URL tem ?session=.
// Deliberadamente FORA do <div animate-fade-in-up> da pagina que a inclui —
// essa classe deixa um transform residual no ancestral (fill-mode "both"),
// o que vira containing block de position:fixed e cortaria o painel na
// altura da pagina em vez da viewport.
?>
<div id="session-panel-overlay" class="fixed inset-0 z-40 hidden">
  <button type="button" id="session-panel-backdrop" aria-label="Fechar" class="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"></button>
  <div class="animate-fade-in-up relative flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-white p-6 shadow-xl dark:bg-slate-900 ml-auto">
    <p id="session-panel-loading" class="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
    <p id="session-panel-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>

    <div id="session-panel-content" class="hidden flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p id="session-panel-atendimento" class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"></p>
          <h2 id="session-panel-patient-name" class="text-lg font-semibold text-slate-900 dark:text-slate-100"></h2>
        </div>
        <a id="session-panel-patient-link" href="#" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
           class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <?php icon('eye', 'h-4 w-4'); ?>
        </a>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label for="panel-scheduledAt" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Data e horario</label>
          <input type="datetime-local" id="panel-scheduledAt" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>
        <div>
          <label for="panel-duration" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Duracao (minutos)</label>
          <input type="number" id="panel-duration" min="5" max="480" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>
        <div>
          <label for="panel-modality" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Modalidade</label>
          <select id="panel-modality" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div id="panel-platformLink-wrap" class="hidden">
          <label for="panel-platformLink" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Link da plataforma</label>
          <input type="text" id="panel-platformLink" placeholder="https://meet.google.com/..." class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
        </div>
        <div>
          <label for="panel-status" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <select id="panel-status" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400">
            <option value="livre">Livre</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" id="panel-sendConfirmation" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
          Enviar confirmacao automatica quando confirmada
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" id="panel-sendReminders" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
          Enviar lembretes automaticos
        </label>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <div class="flex gap-3">
          <button type="button" id="session-panel-save" class="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">Salvar alteracoes</button>
          <button type="button" id="session-panel-close" class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Fechar</button>
        </div>
        <button type="button" id="session-panel-delete" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40" title="Excluir agendamento" aria-label="Excluir agendamento">
          <?php icon('trash-2', 'h-4 w-4'); ?>
        </button>
      </div>
    </div>
  </div>
</div>
<script src="<?= h(APP_URL) ?>/assets/js/session-panel.js"></script>
