// Todos os pequenos formularios da tela de Configuracoes.

(function () {
  "use strict";

  function flash(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("hidden");
    setTimeout(function () { el.classList.add("hidden"); }, 3000);
  }

  function showError(id, message) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function hideError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  }

  // --- Aparencia ---
  document.querySelectorAll(".theme-option-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = btn.getAttribute("data-theme-option");
      PsiAgenda.setTheme(theme);

      document.querySelectorAll(".theme-option-btn").forEach(function (b) {
        b.classList.remove("border-slate-800", "bg-slate-800", "text-white", "dark:border-slate-100", "dark:bg-slate-100", "dark:text-slate-900");
        b.classList.add("border-slate-300", "bg-white", "text-slate-700", "dark:border-slate-700", "dark:bg-slate-900", "dark:text-slate-200");
      });
      btn.classList.remove("border-slate-300", "bg-white", "text-slate-700", "dark:border-slate-700", "dark:bg-slate-900", "dark:text-slate-200");
      btn.classList.add("border-slate-800", "bg-slate-800", "text-white", "dark:border-slate-100", "dark:bg-slate-100", "dark:text-slate-900");

      PsiAgenda.postJSON("/api/settings-appearance", { themePreference: theme }, "PUT").then(function () {
        flash("appearance-feedback");
      });
    });
  });

  // --- Perfil ---
  var profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError("profile-error");
      PsiAgenda.postJSON("/api/settings-profile", {
        fullName: document.getElementById("profile-fullName").value,
        crpNumber: document.getElementById("profile-crpNumber").value,
        phone: document.getElementById("profile-phone").value,
      }, "PUT").then(function (res) {
        if (!res.ok) { showError("profile-error", res.data.error || "Nao foi possivel salvar."); return; }
        flash("profile-success");
      });
    });
  }

  // --- Politica de cobranca ---
  var billingForm = document.getElementById("billing-form");
  if (billingForm) {
    billingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      PsiAgenda.postJSON("/api/settings-billing-policy", {
        noShowChargePolicy: document.getElementById("billing-policy").value,
      }, "PUT").then(function () {
        flash("billing-success");
      });
    });
  }

  // --- Preferencias de lembretes ---
  var remindersForm = document.getElementById("reminders-form");
  if (remindersForm) {
    remindersForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError("reminders-error");
      PsiAgenda.postJSON("/api/settings-reminders", {
        channelEmail: document.getElementById("channelEmail").checked,
        channelWhatsapp: document.getElementById("channelWhatsapp").checked,
        interval7Dias: document.getElementById("interval7Dias").checked,
        interval2Dias: document.getElementById("interval2Dias").checked,
        interval24Horas: document.getElementById("interval24Horas").checked,
      }, "PUT").then(function (res) {
        if (!res.ok) { showError("reminders-error", res.data.error || "Nao foi possivel salvar."); return; }
        flash("reminders-success");
      });
    });
  }

  // --- Seguranca (2FA) ---
  var twoFactorCheckbox = document.getElementById("twoFactorEnabled");
  if (twoFactorCheckbox) {
    twoFactorCheckbox.addEventListener("change", function () {
      PsiAgenda.postJSON("/api/settings-security", { twoFactorEnabled: twoFactorCheckbox.checked }, "PUT").then(function () {
        flash("security-success");
      });
    });
  }

  // --- Trocar senha ---
  var passwordForm = document.getElementById("password-form");
  if (passwordForm) {
    passwordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError("password-error");
      PsiAgenda.postJSON("/api/settings-password", {
        currentPassword: document.getElementById("currentPassword").value,
        newPassword: document.getElementById("newPassword").value,
        confirmPassword: document.getElementById("confirmPassword").value,
      }, "PUT").then(function (res) {
        if (!res.ok) { showError("password-error", res.data.error || "Nao foi possivel alterar a senha."); return; }
        flash("password-success");
        passwordForm.reset();
      });
    });
  }
})();
