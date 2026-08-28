// Formulario de registro de sessao (pages/agenda-registro.php).

(function () {
  "use strict";

  var form = document.getElementById("session-note-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errorEl = document.getElementById("session-note-error");
    var submitBtn = document.getElementById("session-note-submit");
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;

    var sessionId = form.getAttribute("data-session-id");
    var backHref = form.getAttribute("data-back-href");

    var payload = {
      keywordSummary: document.getElementById("keywordSummary").value,
      fullReport: document.getElementById("fullReport").value,
      theoreticalReferences: document.getElementById("theoreticalReferences").value,
    };

    PsiAgenda.postJSON("/api/sessions/" + sessionId + "/note", payload, "PUT").then(function (res) {
      if (!res.ok) {
        errorEl.textContent = res.data.error || "Nao foi possivel salvar o registro.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        return;
      }
      window.location.href = backHref;
    }).catch(function () {
      errorEl.textContent = "Erro de conexao. Tente novamente.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
    });
  });
})();
