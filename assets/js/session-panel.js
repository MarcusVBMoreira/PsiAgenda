// Painel lateral de sessao (agenda). Aberto via ?session={id} na URL,
// espelhando o comportamento do SessionPanel.tsx original: fetch dos
// detalhes, edicao inline, salvar (PUT), excluir (DELETE com confirmacao).

(function () {
  "use strict";

  var overlay = document.getElementById("session-panel-overlay");
  if (!overlay) return; // pagina sem agenda (nao deveria acontecer, mas defensivo)

  var base = window.APP_URL || "";
  var loadingEl = document.getElementById("session-panel-loading");
  var errorEl = document.getElementById("session-panel-error");
  var contentEl = document.getElementById("session-panel-content");
  var currentSession = null;

  function getSessionIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("session");
  }

  function setUrlSession(id) {
    var params = new URLSearchParams(window.location.search);
    if (id) params.set("session", id); else params.delete("session");
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? "?" + qs : "");
    window.history.pushState({}, "", newUrl);
  }

  function toDatetimeLocalInput(datetime) {
    var parts = (datetime || "").split(" ");
    var datePart = parts[0] || "";
    var timePart = (parts[1] || "").slice(0, 5);
    return datePart + "T" + timePart;
  }

  function open(sessionId) {
    overlay.classList.remove("hidden");
    loadingEl.classList.remove("hidden");
    errorEl.classList.add("hidden");
    contentEl.classList.add("hidden");
    contentEl.classList.remove("flex");

    fetch(base + "/api/sessions/" + sessionId)
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (res) {
        loadingEl.classList.add("hidden");
        if (!res.ok) {
          errorEl.textContent = res.data.error || "Nao foi possivel carregar o agendamento.";
          errorEl.classList.remove("hidden");
          return;
        }
        currentSession = res.data.session;
        populate(currentSession);
        contentEl.classList.remove("hidden");
        contentEl.classList.add("flex");
      })
      .catch(function () {
        loadingEl.classList.add("hidden");
        errorEl.textContent = "Erro de conexao.";
        errorEl.classList.remove("hidden");
      });
  }

  function populate(session) {
    document.getElementById("session-panel-atendimento").textContent = "Atendimento " + session.sequential_number;
    document.getElementById("session-panel-patient-name").textContent = session.patient_name;
    document.getElementById("session-panel-patient-link").href = base + "/pacientes/" + session.patient_id + "/visualizar";

    document.getElementById("panel-scheduledAt").value = toDatetimeLocalInput(session.scheduled_at);
    document.getElementById("panel-duration").value = session.duration_minutes;
    document.getElementById("panel-modality").value = session.modality;
    document.getElementById("panel-platformLink").value = session.platform_link || "";
    togglePlatformLink();

    var statusSelect = document.getElementById("panel-status");
    var hasOption = Array.prototype.some.call(statusSelect.options, function (o) { return o.value === session.status; });
    if (!hasOption) {
      var opt = document.createElement("option");
      opt.value = session.status;
      opt.textContent = session.status;
      statusSelect.appendChild(opt);
    }
    statusSelect.value = session.status;

    document.getElementById("panel-sendConfirmation").checked = Boolean(session.send_confirmation);
    document.getElementById("panel-sendReminders").checked = Boolean(session.send_reminders);
  }

  function togglePlatformLink() {
    var wrap = document.getElementById("panel-platformLink-wrap");
    wrap.classList.toggle("hidden", document.getElementById("panel-modality").value !== "online");
  }
  document.getElementById("panel-modality").addEventListener("change", togglePlatformLink);

  function close() {
    overlay.classList.add("hidden");
    currentSession = null;
    setUrlSession(null);
  }

  document.getElementById("session-panel-backdrop").addEventListener("click", close);
  document.getElementById("session-panel-close").addEventListener("click", close);

  document.getElementById("session-panel-save").addEventListener("click", function () {
    if (!currentSession) return;
    var btn = this;
    btn.disabled = true;
    errorEl.classList.add("hidden");

    var payload = {
      scheduledAt: document.getElementById("panel-scheduledAt").value,
      durationMinutes: Number(document.getElementById("panel-duration").value),
      modality: document.getElementById("panel-modality").value,
      platformLink: document.getElementById("panel-platformLink").value,
      status: document.getElementById("panel-status").value,
      cancellationReason: currentSession.cancellation_reason || "",
      sendConfirmation: document.getElementById("panel-sendConfirmation").checked,
      sendReminders: document.getElementById("panel-sendReminders").checked,
      reminderLead7Dias: currentSession.reminder_lead_7_dias || "padrao",
      reminderLead2Dias: currentSession.reminder_lead_2_dias || "padrao",
      reminderLead24Horas: currentSession.reminder_lead_24_horas || "padrao",
    };

    PsiAgenda.postJSON("/api/sessions/" + currentSession.id, payload, "PUT").then(function (res) {
      btn.disabled = false;
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel salvar.";
        errorEl.classList.remove("hidden");
        return;
      }
      window.location.reload();
    }).catch(function () {
      btn.disabled = false;
      errorEl.textContent = "Erro de conexao.";
      errorEl.classList.remove("hidden");
    });
  });

  document.getElementById("session-panel-delete").addEventListener("click", function () {
    if (!currentSession) return;
    if (!window.confirm("Excluir este agendamento? Tambem remove o registro de sessao vinculado a ele, se houver. Esta acao nao pode ser desfeita.")) {
      return;
    }
    PsiAgenda.postJSON("/api/sessions/" + currentSession.id, {}, "DELETE").then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel excluir.";
        errorEl.classList.remove("hidden");
        return;
      }
      window.location.reload();
    });
  });

  window.addEventListener("popstate", function () {
    var id = getSessionIdFromUrl();
    if (id) open(id); else close();
  });

  var initialId = getSessionIdFromUrl();
  if (initialId) open(initialId);
})();
