/**
 * Lógica compartilhada pelos 3 formulários: liga o evento de envio,
 * mostra estado de carregamento e a mensagem de sucesso/erro.
 *
 * Uso em cada página de formulário:
 *   ligarFormulario({
 *     sheet: CONFIG.backend.ABA_VOLUNTARIOS,
 *     form: document.getElementById("form"),
 *     status: document.getElementById("status"),
 *     montarDados: () => ({ nome: ..., email: ... }),
 *   });
 */
function ligarFormulario({ sheet, form, status, montarDados }) {
  const botao = form.querySelector('button[type="submit"]');
  const textoOriginal = botao.textContent;

  function mostrarStatus(tipo, mensagem) {
    status.textContent = mensagem;
    status.className = "form-status form-status--visible form-status--" + tipo;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    botao.disabled = true;
    botao.textContent = "Enviando...";
    status.className = "form-status";

    try {
      const dados = montarDados();
      await Backend.enviarFormulario(sheet, dados);
      form.reset();
      form.querySelectorAll(".choice input:checked").forEach((c) => (c.checked = false));
      mostrarStatus(
        "ok",
        "Recebemos sua inscrição! Obrigado por fazer parte do mutirão. 🙌"
      );
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (erro) {
      console.error(erro);
      mostrarStatus(
        "error",
        "Não foi possível enviar agora (" + erro.message + "). " +
          "Verifique sua internet e tente de novo. Se o problema continuar, avise a organização."
      );
    } finally {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });
}
