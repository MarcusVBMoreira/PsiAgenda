// Envio do formulario de paciente (novo e edicao) + mascara de telefone.
// O <form id="patient-form"> carrega data-patient-id quando for edicao.

(function () {
  "use strict";

  var form = document.getElementById("patient-form");
  if (!form) return;

  function formatBrazilianPhone(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return "(" + digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10) return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7, 11);
  }

  ["phone", "emergencyContactPhone"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function (e) {
        e.target.value = formatBrazilianPhone(e.target.value);
      });
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errorEl = document.getElementById("patient-form-error");
    var submitBtn = document.getElementById("patient-form-submit");
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;

    var patientId = form.getAttribute("data-patient-id");
    var payload = {
      fullName: document.getElementById("fullName").value,
      birthDate: document.getElementById("birthDate").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      emergencyContactName: document.getElementById("emergencyContactName").value,
      emergencyContactPhone: document.getElementById("emergencyContactPhone").value,
      medicalHistory: document.getElementById("medicalHistory").value,
      medications: document.getElementById("medications").value,
      treatmentFrequency: document.getElementById("treatmentFrequency").value,
      status: document.getElementById("status").value,
      remindersEnabled: document.getElementById("remindersEnabled").checked,
      reminderLead7Dias: document.getElementById("reminderLead7Dias").value,
      reminderLead2Dias: document.getElementById("reminderLead2Dias").value,
      reminderLead24Horas: document.getElementById("reminderLead24Horas").value,
    };

    var url = patientId ? "/api/patients/" + patientId : "/api/patients";
    var method = patientId ? "PUT" : "POST";

    PsiAgenda.postJSON(url, payload, method).then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel salvar o paciente.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        return;
      }
      window.location.href = window.APP_URL + "/pacientes";
    }).catch(function () {
      errorEl.textContent = "Erro de conexao. Tente novamente.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
    });
  });
})();
