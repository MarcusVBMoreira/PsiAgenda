// Botao de mostrar/ocultar senha (icone de olho), em qualquer campo gerado
// por passwordField() (app/form_helpers.php).

(function () {
  "use strict";

  document.querySelectorAll(".password-toggle-btn").forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute("data-target"));
    var showIcon = btn.querySelector(".password-toggle-icon-show");
    var hideIcon = btn.querySelector(".password-toggle-icon-hide");
    if (!input) return;

    btn.addEventListener("click", function () {
      var isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      showIcon.classList.toggle("hidden", isHidden);
      hideIcon.classList.toggle("hidden", !isHidden);
      btn.setAttribute("aria-label", isHidden ? "Ocultar senha" : "Mostrar senha");
      btn.setAttribute("title", isHidden ? "Ocultar senha" : "Mostrar senha");
    });
  });
})();
