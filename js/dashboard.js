/**
 * Lógica do painel de acompanhamento. Lê a aba "voluntarios" da
 * planilha, calcula os indicadores e desenha a tabela de presença.
 * Atualiza sozinho a cada INTERVALO_ATUALIZACAO_MS (não é "tempo real"
 * de verdade, mas fica bem próximo disso sem precisar de servidor).
 */

const INTERVALO_ATUALIZACAO_MS = 20000;

let voluntarios = [];
let filtroAtual = { curso: "", disponibilidade: "", funcao: "" };

async function carregarPainel() {
  const avisoErro = document.getElementById("erro-carregamento");
  try {
    voluntarios = await Backend.lerAba(CONFIG.backend.ABA_VOLUNTARIOS);
    avisoErro.style.display = "none";
    popularFiltros();
    renderizarTudo();
  } catch (erro) {
    console.error(erro);
    avisoErro.textContent = "Não foi possível carregar os dados: " + erro.message;
    avisoErro.style.display = "block";
  }
}

function voluntariosFiltrados() {
  return voluntarios.filter((v) => {
    if (filtroAtual.curso && v.Curso !== filtroAtual.curso) return false;
    if (filtroAtual.disponibilidade && !String(v.Disponibilidade).includes(filtroAtual.disponibilidade)) return false;
    if (filtroAtual.funcao && v.Funcao !== filtroAtual.funcao) return false;
    return true;
  });
}

function renderizarTudo() {
  renderizarIndicadores();
  renderizarFuncoes();
  renderizarTabela();
}

// ---------- Indicadores (topo) ----------
function renderizarIndicadores() {
  const total = voluntarios.length;
  const confirmados = voluntarios.filter((v) => v.Confirmado === "Sim").length;
  const compareceram = voluntarios.filter((v) => v.Presenca === "Compareceu").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-confirmados").textContent = confirmados;
  document.getElementById("stat-compareceram").textContent = compareceram;
}

// ---------- Funções: quantos já se inscreveram ----------
// Sem limite/meta por função de propósito — quanto mais gente se
// inscrever em qualquer função, melhor. A barra é só uma comparação
// visual entre as funções, não uma "vaga cheia".
function renderizarFuncoes() {
  const responsaveis = CONFIG.responsaveisPorFuncao || {};
  const contagem = {};
  voluntarios.forEach((v) => {
    if (v.Funcao) contagem[v.Funcao] = (contagem[v.Funcao] || 0) + 1;
  });

  // Mostra as funções sugeridas em config.js (mesmo com 0 inscritos)
  // mais qualquer função extra que apareça nos dados (ex: "Outra").
  const nomes = new Set([...(CONFIG.voluntario.funcoes || []), ...Object.keys(contagem)]);

  const funcoes = [...nomes].map((nome) => ({
    nome,
    total: contagem[nome] || 0,
    responsavel: responsaveis[nome] || "—",
  }));
  funcoes.sort((a, b) => b.total - a.total);

  const maior = Math.max(1, ...funcoes.map((f) => f.total));
  const wrap = document.getElementById("funcoes-lista");
  wrap.innerHTML = "";

  funcoes.forEach((f) => {
    const pct = Math.round((f.total / maior) * 100);
    const div = document.createElement("div");
    div.className = "role-bar";
    div.innerHTML = `
      <div class="top">
        <span><strong>${f.nome}</strong> <span class="muted">· responsável: ${f.responsavel}</span></span>
        <span class="tabular">${f.total} ${f.total === 1 ? "inscrito" : "inscritos"}</span>
      </div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
    `;
    wrap.appendChild(div);
  });
}

// ---------- Filtros ----------
function popularFiltros() {
  const selectCurso = document.getElementById("filtro-curso");
  const selectFuncao = document.getElementById("filtro-funcao");
  const selectDisponibilidade = document.getElementById("filtro-disponibilidade");

  if (!selectDisponibilidade.dataset.pronto) {
    CONFIG.voluntario.disponibilidade.forEach((d) => {
      selectDisponibilidade.appendChild(new Option(d.rotulo, d.rotulo));
    });
    selectDisponibilidade.dataset.pronto = "1";
  }

  if (!selectCurso.dataset.pronto) {
    const cursos = [...new Set(voluntarios.map((v) => v.Curso).filter(Boolean))].sort();
    cursos.forEach((c) => selectCurso.appendChild(new Option(c, c)));
    selectCurso.dataset.pronto = "1";
  }

  if (!selectFuncao.dataset.pronto) {
    const funcoes = [...new Set(voluntarios.map((v) => v.Funcao).filter(Boolean))].sort();
    funcoes.forEach((f) => selectFuncao.appendChild(new Option(f, f)));
    selectFuncao.dataset.pronto = "1";
  }
}

// ---------- Tabela de presença ----------
function renderizarTabela() {
  const corpo = document.getElementById("tabela-corpo");
  const lista = voluntariosFiltrados();
  corpo.innerHTML = "";

  if (!lista.length) {
    document.getElementById("tabela-vazia").style.display = "block";
    return;
  }
  document.getElementById("tabela-vazia").style.display = "none";

  lista.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(v.Nome)}</strong></td>
      <td>${escapeHtml(v.Curso)}</td>
      <td>${escapeHtml(v.Disponibilidade)}</td>
      <td>${escapeHtml(v.Funcao)}</td>
      <td class="col-confirmado"></td>
      <td class="col-presenca"></td>
      <td class="muted">${escapeHtml(v.Observacoes || "—")}</td>
    `;

    tr.querySelector(".col-confirmado").appendChild(
      criarToggle({
        opcoes: [
          { valor: "", rotulo: "Pendente", classe: "warn" },
          { valor: "Sim", rotulo: "Confirmado", classe: "good" },
        ],
        valorAtual: v.Confirmado || "",
        aoMudar: (novoValor) => atualizar(v, { confirmado: novoValor }),
      })
    );

    tr.querySelector(".col-presenca").appendChild(
      criarToggle({
        opcoes: [
          { valor: "", rotulo: "—", classe: "" },
          { valor: "Compareceu", rotulo: "Compareceu", classe: "good" },
          { valor: "Faltou", rotulo: "Faltou", classe: "critical" },
        ],
        valorAtual: v.Presenca || "",
        aoMudar: (novoValor) => atualizar(v, { presenca: novoValor }),
      })
    );

    corpo.appendChild(tr);
  });
}

function criarToggle({ opcoes, valorAtual, aoMudar }) {
  const wrap = document.createElement("div");
  wrap.className = "status-toggle";
  opcoes.forEach((op) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = op.rotulo;
    btn.className = op.classe;
    btn.dataset.active = String(op.valor === valorAtual);
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach((b) => (b.dataset.active = "false"));
      btn.dataset.active = "true";
      aoMudar(op.valor);
    });
    wrap.appendChild(btn);
  });
  return wrap;
}

async function atualizar(voluntario, campos) {
  // Atualiza localmente primeiro (sensação instantânea), depois grava.
  if (campos.confirmado !== undefined) voluntario.Confirmado = campos.confirmado;
  if (campos.presenca !== undefined) voluntario.Presenca = campos.presenca;
  renderizarIndicadores();
  try {
    await Backend.atualizarStatus(CONFIG.backend.ABA_VOLUNTARIOS, voluntario.ID, campos);
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível salvar agora: " + erro.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- Boot ----------
document.getElementById("filtro-curso").addEventListener("change", (e) => {
  filtroAtual.curso = e.target.value;
  renderizarTabela();
});
document.getElementById("filtro-disponibilidade").addEventListener("change", (e) => {
  filtroAtual.disponibilidade = e.target.value;
  renderizarTabela();
});
document.getElementById("filtro-funcao").addEventListener("change", (e) => {
  filtroAtual.funcao = e.target.value;
  renderizarTabela();
});

carregarPainel();
setInterval(carregarPainel, INTERVALO_ATUALIZACAO_MS);
