// Botao "Marcar como revisado" da Central de alertas.

(function () {
  "use strict";

  document.querySelectorAll(".review-adherence-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.disabled = true;
      var alertId = btn.getAttribute("data-alert-id");
      PsiAgenda.postJSON("/api/adherence-alerts/" + alertId, {}, "PUT").then(function () {
        window.location.reload();
      }).catch(function () {
        btn.disabled = false;
      });
    });
  });
})();
