// Notificacao flutuante (toast), reutilizavel em qualquer tela via
// PsiAgenda.showToast(mensagem, tipo). Substitui os textos estaticos de
// "salvo com sucesso" por um feedback mais visivel e consistente.

(function () {
  "use strict";

  window.PsiAgenda = window.PsiAgenda || {};

  var container = null;
  function getContainer() {
    if (container) return container;
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 right-4 z-50 flex flex-col gap-2";
    document.body.appendChild(container);
    return container;
  }

  var ICONS = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
  };

  var STYLES = {
    success: "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  };

  /** tipo: "success" (padrao) ou "error" */
  window.PsiAgenda.showToast = function (message, tipo) {
    tipo = tipo === "error" ? "error" : "success";
    var el = document.createElement("div");
    el.className = "animate-fade-in-up flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium shadow-lg " + STYLES[tipo];
    el.innerHTML = ICONS[tipo] + '<span></span>';
    el.querySelector("span").textContent = message;
    getContainer().appendChild(el);

    setTimeout(function () {
      el.style.transition = "opacity 0.25s ease-out, transform 0.25s ease-out";
      el.style.opacity = "0";
      el.style.transform = "translateY(4px)";
      setTimeout(function () { el.remove(); }, 250);
    }, 2800);
  };
})();
