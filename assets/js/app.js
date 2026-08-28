// Script global, carregado em toda pagina (includes/footer.php e
// includes/auth-footer.php). Responsavel por: logout, e o utilitario de
// tema (usado pela tela de Configuracoes mais adiante).

(function () {
  "use strict";

  var base = window.APP_URL || "";

  var logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      fetch(base + "/api/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": window.CSRF_TOKEN || "" },
      }).finally(function () {
        window.location.href = base + "/login";
      });
    });
  }

  window.PsiAgenda = window.PsiAgenda || {};

  /**
   * fetch() com o corpo em JSON e o token CSRF ja anexado — use pra todo
   * POST/PUT/DELETE contra api/*.php. GET normal nao precisa disso.
   */
  window.PsiAgenda.postJSON = function (url, data, method) {
    return fetch(base + url, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window.CSRF_TOKEN || "",
      },
      body: JSON.stringify(data || {}),
    }).then(function (res) {
      return res.json().then(function (body) {
        return { ok: res.ok, status: res.status, data: body };
      });
    });
  };

  // Exposto globalmente para a tela de Configuracoes (Aparencia) usar.
  window.PsiAgenda.setTheme = function (theme) {
    localStorage.setItem("theme", theme);
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  };
})();
