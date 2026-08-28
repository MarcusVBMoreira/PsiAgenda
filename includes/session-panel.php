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

      <a id="session-panel-rescheduled-to" href="#" class="hidden rounded-md border border-blue-200 bg-blue-50 p-3 text-left text-sm text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/60"></a>
      <a id="session-panel-rescheduled-from" href="#" class="hidden flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800">
        <span id="session-panel-rescheduled-from-main"></span>
        <span id="session-panel-rescheduled-from-detail" class="text-xs text-slate-500 dark:text-slate-400"></span>
      </a>

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
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Confirmacao e lembretes</p>
        <p id="session-panel-patient-reminders-warning" class="hidden text-xs text-amber-600 dark:text-amber-400">
          Este paciente esta com envios automaticos desativados nas configuracoes do paciente, mesmo que as opcoes abaixo estejam marcadas.
        </p>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" id="panel-sendConfirmation" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
          Enviar confirmacao automatica quando confirmada
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" id="panel-sendReminders" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
          Enviar lembretes automaticos
        </label>
        <p id="session-panel-confirmation-status" class="text-xs text-slate-400 dark:text-slate-500">Confirmacao ainda nao enviada.</p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" id="session-panel-send-confirmation" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Enviar confirmacao agora</button>
          <button type="button" id="session-panel-send-reminder" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Enviar lembrete agora</button>
        </div>
        <p id="session-panel-send-feedback" class="hidden text-xs text-slate-600 dark:text-slate-300"></p>
      </div>

      <a id="session-panel-note-link" href="#" class="hidden rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Registro de sessao</a>

      <div id="session-panel-reschedule-block" class="hidden flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <div id="session-panel-reschedule-form" class="hidden flex-col gap-2">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Reagendar sessao</p>
          <div>
            <label for="reschedule-newScheduledAt" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Nova data e horario</label>
            <input type="datetime-local" id="reschedule-newScheduledAt" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          </div>
          <div>
            <label for="reschedule-reason" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Motivo</label>
            <textarea id="reschedule-reason" rows="2" placeholder="Ex.: Paciente com imprevisto de trabalho" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"></textarea>
          </div>
          <div>
            <label for="reschedule-requestedBy" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Solicitado por</label>
            <select id="reschedule-requestedBy" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="paciente">Paciente</option>
              <option value="profissional">Profissional</option>
            </select>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" id="reschedule-charged" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
            Houve cobranca pelo reagendamento
          </label>
          <p id="reschedule-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          <div class="flex gap-2 pt-1">
            <button type="button" id="reschedule-confirm" class="rounded-md bg-slate-800 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">Confirmar reagendamento</button>
            <button type="button" id="reschedule-close" class="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Fechar</button>
          </div>
        </div>
        <button type="button" id="reschedule-open" class="self-start text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">Reagendar sessao</button>
      </div>

      <div id="session-panel-cancel-block" class="hidden flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
        <div id="session-panel-cancel-form" class="hidden flex-col gap-2">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Cancelar sessao</p>
          <div>
            <label for="cancel-reason" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Motivo do cancelamento</label>
            <textarea id="cancel-reason" rows="2" placeholder="Ex.: Paciente informou que nao podera comparecer" class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"></textarea>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" id="cancel-charged" class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800">
            Houve cobranca pelo cancelamento
          </label>
          <p id="cancel-error" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          <div class="flex gap-2 pt-1">
            <button type="button" id="cancel-confirm" class="rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">Confirmar cancelamento</button>
            <button type="button" id="cancel-close" class="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Fechar</button>
          </div>
        </div>
        <p id="cancel-existing-reason" class="hidden text-xs text-slate-500 dark:text-slate-400"></p>
        <button type="button" id="cancel-open" class="self-start text-sm font-medium text-red-600 transition-colors hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300">Cancelar sessao</button>
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
