// Formulario de documento formal (pages/pacientes-documentos-novo.php).
// Troca o corpo pelo modelo inicial do tipo escolhido, mas so enquanto o
// profissional ainda nao tiver comecado a editar (nunca sobrescreve texto
// ja escrito).

(function () {
  "use strict";

  var form = document.getElementById("formal-document-form");
  if (!form) return;

  var typeSelect = document.getElementById("type");
  var bodyField = document.getElementById("body");
  var patientName = form.getAttribute("data-patient-name");
  var bodyTouched = false;

  function applyTemplate(type) {
    var template = (window.FORMAL_DOCUMENT_TEMPLATES || {})[type] || "";
    bodyField.value = template.split("[PACIENTE]").join(patientName);
  }

  applyTemplate(typeSelect.value);

  typeSelect.addEventListener("change", function () {
    if (!bodyTouched) applyTemplate(typeSelect.value);
  });

  bodyField.addEventListener("input", function () {
    bodyTouched = true;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errorEl = document.getElementById("formal-document-error");
    var submitBtn = document.getElementById("formal-document-submit");
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;

    var patientId = form.getAttribute("data-patient-id");
    var payload = {
      type: typeSelect.value,
      title: document.getElementById("title").value,
      body: bodyField.value,
    };

    PsiAgenda.postJSON("/api/patients/" + patientId + "/formal-documents", payload, "POST").then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel gerar o documento.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        return;
      }
      window.location.href = window.APP_URL + "/pacientes/" + patientId + "/visualizar?tab=documentos";
    }).catch(function () {
      errorEl.textContent = "Erro de conexao. Tente novamente.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
    });
  });
})();
