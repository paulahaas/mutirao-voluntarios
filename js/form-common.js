/**
 * Lógica compartilhada pelos 3 formulários: liga o evento de envio,
 * mostra estado de carregamento, confirma que o registro realmente
 * chegou na planilha e barra a maioria dos envios automáticos (bots).
 *
 * Uso em cada página de formulário:
 *   ligarFormulario({
 *     sheet: CONFIG.backend.ABA_VOLUNTARIOS,
 *     form: document.getElementById("form"),
 *     status: document.getElementById("status"),
 *     montarDados: () => ({ nome: ..., email: ... }),
 *   });
 *
 * O HTML do formulário deve ter um campo-armadilha invisível chamado
 * "site" (veja o CSS .honeypot) — pessoas nunca preenchem esse campo,
 * só bots automáticos costumam preencher todos os campos que encontram.
 */
function ligarFormulario({ sheet, form, status, montarDados }) {
  const botao = form.querySelector('button[type="submit"]');
  const textoOriginal = botao.textContent;
  const honeypot = form.querySelector('input[name="site"]');

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

    // Campo-armadilha preenchido = quase certamente um bot. Finge que
    // deu certo (para o bot não insistir) sem gravar nada de verdade.
    if (honeypot && honeypot.value.trim() !== "") {
      form.reset();
      mostrarStatus("ok", "Recebemos sua inscrição! Obrigado por fazer parte do mutirão. 🙌");
      return;
    }

    botao.disabled = true;
    botao.textContent = "Enviando...";
    status.className = "form-status";

    try {
      const dados = montarDados();
      const id = await Backend.enviarFormulario(sheet, dados);

      botao.textContent = "Confirmando...";
      const confirmado = await Backend.confirmarChegada(sheet, id);

      form.reset();
      form.querySelectorAll(".choice input:checked").forEach((c) => (c.checked = false));

      if (confirmado) {
        mostrarStatus(
          "ok",
          "Recebemos sua inscrição! Obrigado por fazer parte do mutirão. 🙌"
        );
      } else {
        mostrarStatus(
          "ok",
          "Envio feito! Não conseguimos confirmar agora que chegou na planilha — " +
            "se não aparecer no painel em alguns minutos, tente enviar de novo."
        );
      }
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
