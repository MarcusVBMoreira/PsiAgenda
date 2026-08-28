// Formulario de novo agendamento (assets/js, usado por pages/agenda-novo.php).

(function () {
  "use strict";

  var form = document.getElementById("new-session-form");
  if (!form) return;

  var modalitySelect = document.getElementById("modality");
  function togglePlatformLink() {
    document.getElementById("platformLink-wrap").classList.toggle("hidden", modalitySelect.value !== "online");
  }
  modalitySelect.addEventListener("change", togglePlatformLink);
  togglePlatformLink();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errorEl = document.getElementById("new-session-error");
    var submitBtn = document.getElementById("new-session-submit");
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;

    var payload = {
      patientId: document.getElementById("patientId").value,
      scheduledAt: document.getElementById("scheduledAt").value,
      durationMinutes: Number(document.getElementById("durationMinutes").value),
      modality: modalitySelect.value,
      platformLink: document.getElementById("platformLink").value,
      status: document.getElementById("status").value,
      sendConfirmation: document.getElementById("sendConfirmation").checked,
      sendReminders: document.getElementById("sendReminders").checked,
      reminderLead7Dias: document.getElementById("reminderLead7Dias").value,
      reminderLead2Dias: document.getElementById("reminderLead2Dias").value,
      reminderLead24Horas: document.getElementById("reminderLead24Horas").value,
    };

    if (!payload.patientId) {
      errorEl.textContent = "Cadastre um paciente antes de criar um agendamento.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      return;
    }

    PsiAgenda.postJSON("/api/sessions", payload).then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel criar o agendamento.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        return;
      }
      window.location.href = window.APP_URL + "/agenda";
    }).catch(function () {
      errorEl.textContent = "Erro de conexao. Tente novamente.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
    });
  });
})();
