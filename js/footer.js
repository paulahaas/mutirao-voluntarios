/**
 * Preenche o rodapé "Sobre nós" a partir de CONFIG.instituicao.
 * Usado em todas as páginas — veja config.js para editar o texto,
 * a logo e o link.
 */
(function () {
  const inst = CONFIG.instituicao;
  if (!inst) return;

  const logoImg = document.getElementById("footer-logo-img");
  if (inst.logo) {
    logoImg.src = inst.logo;
    logoImg.alt = inst.nome || "";
    logoImg.hidden = false;
  }

  const descricaoEl = document.getElementById("footer-descricao");
  if (descricaoEl) descricaoEl.textContent = inst.descricao || "";

  const linkEl = document.getElementById("footer-link");
  if (linkEl) {
    if (inst.link) {
      linkEl.href = inst.link;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }
  }
})();
