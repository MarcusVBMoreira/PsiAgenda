// Widget reutilizavel "gerar PDF" (PDF geral do paciente / PDF de sessao),
// portado de GeneratePdfButton.tsx. Inicializa qualquer
// <div class="generate-pdf-widget" data-endpoint="..." data-redirect="...">
// contendo um checkbox .gpw-accessible e um botao .gpw-submit.

(function () {
  "use strict";

  document.querySelectorAll(".generate-pdf-widget").forEach(function (widget) {
    var endpoint = widget.getAttribute("data-endpoint");
    var redirectTo = widget.getAttribute("data-redirect") || "";
    var checkbox = widget.querySelector(".gpw-accessible");
    var errorEl = widget.querySelector(".gpw-error");
    var submitBtn = widget.querySelector(".gpw-submit");

    submitBtn.addEventListener("click", function () {
      submitBtn.disabled = true;
      errorEl.classList.add("hidden");

      PsiAgenda.postJSON(endpoint, { includeAccessible: checkbox.checked }, "POST").then(function (res) {
        submitBtn.disabled = false;
        if (!res.ok) {
          errorEl.textContent = res.data.error || "Nao foi possivel gerar o PDF.";
          errorEl.classList.remove("hidden");
          return;
        }
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          window.location.reload();
        }
      }).catch(function () {
        submitBtn.disabled = false;
        errorEl.textContent = "Erro de conexao.";
        errorEl.classList.remove("hidden");
      });
    });
  });

  // Botao de excluir documento — confirmacao simples (window.confirm),
  // mesma pratica usada no restante do site nesta fase da migracao.
  document.querySelectorAll(".delete-document-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!window.confirm("Excluir este documento? O arquivo em PDF sera removido permanentemente. Esta acao nao pode ser desfeita.")) {
        return;
      }
      var documentId = btn.getAttribute("data-document-id");
      PsiAgenda.postJSON("/api/documents/" + documentId, {}, "DELETE").then(function (res) {
        if (!res.ok) {
          window.alert(res.data.error || "Nao foi possivel excluir.");
          return;
        }
        window.location.reload();
      });
    });
  });
})();
