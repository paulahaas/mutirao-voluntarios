/**
 * Lógica da página de check-in. Lista todo mundo que se inscreveu
 * como voluntário e deixa marcar/desmarcar presença com um toque —
 * pensado pra usar no tablet/celular da recepção no dia do mutirão
 * (ou pela própria pessoa, escaneando o QR Code de check-in).
 */

const INTERVALO_ATUALIZACAO_MS = 15000;

let voluntarios = [];
let termoBusca = "";

async function carregar() {
  const erro = document.getElementById("erro-carregamento");
  try {
    voluntarios = await Backend.lerAba(CONFIG.backend.ABA_VOLUNTARIOS);
    erro.style.display = "none";
    renderizar();
  } catch (e) {
    console.error(e);
    erro.textContent = "Não foi possível carregar a lista: " + e.message;
    erro.style.display = "block";
  }
}

function renderizar() {
  const lista = document.getElementById("lista-checkin");
  const vazio = document.getElementById("vazio");
  const contador = document.getElementById("contador");

  const termo = termoBusca.trim().toLowerCase();
  const filtrados = termo
    ? voluntarios.filter((v) => v.Nome.toLowerCase().includes(termo))
    : voluntarios;

  const presentes = voluntarios.filter((v) => v.Presenca === "Compareceu").length;
  contador.textContent = presentes + " de " + voluntarios.length + " já marcaram presença";

  lista.innerHTML = "";

  if (!filtrados.length) {
    vazio.style.display = "block";
    return;
  }
  vazio.style.display = "none";

  filtrados.forEach((v) => {
    const presente = v.Presenca === "Compareceu";

    const item = document.createElement("div");
    item.className = "checkin-item card";
    item.innerHTML = `
      <div class="checkin-info">
        <strong>${escapeHtml(v.Nome)}</strong>
        <span class="muted">${escapeHtml(v.Funcao || "—")}</span>
      </div>
      <button type="button" class="btn ${presente ? "btn--pine" : "btn--primary"} btn--sm">
        ${presente ? "✓ Presente" : "Marcar presença"}
      </button>
    `;
    item.querySelector("button").addEventListener("click", () => marcarPresenca(v, !presente));
    lista.appendChild(item);
  });
}

async function marcarPresenca(voluntario, presente) {
  const anterior = voluntario.Presenca;
  voluntario.Presenca = presente ? "Compareceu" : "";
  renderizar();
  try {
    await Backend.atualizarStatus(CONFIG.backend.ABA_VOLUNTARIOS, voluntario.ID, {
      presenca: voluntario.Presenca,
    });
  } catch (erro) {
    console.error(erro);
    voluntario.Presenca = anterior;
    renderizar();
    alert("Não foi possível salvar agora: " + erro.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.getElementById("busca").addEventListener("input", (e) => {
  termoBusca = e.target.value;
  renderizar();
});

carregar();
setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
