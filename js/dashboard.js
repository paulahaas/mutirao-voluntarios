/**
 * Lógica do painel de acompanhamento. Lê a aba "voluntarios" da
 * planilha, calcula os indicadores e desenha a tabela de presença.
 * Atualiza sozinho a cada INTERVALO_ATUALIZACAO_MS (não é "tempo real"
 * de verdade, mas fica bem próximo disso sem precisar de servidor).
 */

const INTERVALO_ATUALIZACAO_MS = 20000;

let voluntarios = [];
let contribuicoes = [];
let filtroAtual = { curso: "", disponibilidade: "", funcao: "" };
let filtroContrib = { tipo: "", status: "" };

const STATUS_DOACAO =
  CONFIG.statusDoacao && CONFIG.statusDoacao.length
    ? CONFIG.statusDoacao
    : ["Novo", "Em contato", "Recebido", "Cancelado"];
const STATUS_PADRAO = STATUS_DOACAO[0];

async function carregarPainel() {
  const avisoErro = document.getElementById("erro-carregamento");
  try {
    const [vols, doadores, parceiros] = await Promise.all([
      Backend.lerAba(CONFIG.backend.ABA_VOLUNTARIOS),
      Backend.lerAba(CONFIG.backend.ABA_DOADORES),
      Backend.lerAba(CONFIG.backend.ABA_PARCEIROS),
    ]);
    voluntarios = vols;
    contribuicoes = [
      ...doadores.reverse().map((d) => ({
        tipo: "Doação",
        aba: CONFIG.backend.ABA_DOADORES,
        id: d.ID,
        nome: d.Nome,
        item: d.TipoContribuicao,
        detalhe: d.Descricao,
        email: d.Email,
        telefone: d.Telefone,
        status: d.Status || STATUS_PADRAO,
      })),
      ...parceiros.reverse().map((p) => ({
        tipo: "Parceria",
        aba: CONFIG.backend.ABA_PARCEIROS,
        id: p.ID,
        nome: p.Responsavel ? `${p.Empresa} (${p.Responsavel})` : p.Empresa,
        item: p.TipoParceria,
        detalhe: p.Descricao,
        email: p.Email,
        telefone: p.Telefone,
        status: p.Status || STATUS_PADRAO,
      })),
    ];
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
  renderizarContribuicoes();
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

// ---------- Doações e parcerias: status ----------
function tomDoStatus(status) {
  if (/receb|entreg|conclu/i.test(status)) return "good";
  if (/cancel|desist|recus/i.test(status)) return "critical";
  if (/contat|andamento|combin|aguard/i.test(status)) return "warn";
  return "neutral";
}

function renderizarResumoStatus() {
  const wrap = document.getElementById("status-resumo");
  const contagem = {};
  contribuicoes.forEach((c) => {
    contagem[c.status] = (contagem[c.status] || 0) + 1;
  });
  // Mostra os status de config.js (mesmo com 0) e qualquer valor extra
  // que alguém tenha digitado direto na planilha.
  const nomes = [...new Set([...STATUS_DOACAO, ...Object.keys(contagem)])];

  wrap.innerHTML = "";
  const tiles = [{ rotulo: "Total", valor: contribuicoes.length, destaque: false }].concat(
    nomes.map((n) => ({ rotulo: n, valor: contagem[n] || 0, destaque: tomDoStatus(n) === "good" }))
  );
  tiles.forEach((t) => {
    const div = document.createElement("div");
    div.className = "stat-tile";
    div.innerHTML = `
      <div class="label">${escapeHtml(t.rotulo)}</div>
      <div class="value tabular${t.destaque ? " accent" : ""}">${t.valor}</div>
    `;
    wrap.appendChild(div);
  });
}

function renderizarContribuicoes() {
  renderizarResumoStatus();

  // Não redesenha a tabela enquanto alguém está com a lista de status
  // aberta — senão o próximo auto-refresh fecharia o menu no meio.
  const ativo = document.activeElement;
  if (ativo && ativo.classList && ativo.classList.contains("status-select")) return;

  const corpo = document.getElementById("tabela-contribuicoes");
  const vazio = document.getElementById("contribuicoes-vazia");
  const lista = contribuicoes.filter(
    (c) =>
      (!filtroContrib.tipo || c.tipo === filtroContrib.tipo) &&
      (!filtroContrib.status || c.status === filtroContrib.status)
  );
  corpo.innerHTML = "";
  vazio.style.display = lista.length ? "none" : "block";

  lista.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge--neutral">${escapeHtml(c.tipo)}</span></td>
      <td><strong>${escapeHtml(c.nome)}</strong></td>
      <td>${escapeHtml(c.item || "—")}</td>
      <td class="muted">${escapeHtml(c.detalhe || "—")}</td>
      <td class="muted">${escapeHtml(c.email || "")}${c.email && c.telefone ? "<br>" : ""}${escapeHtml(c.telefone || "")}</td>
      <td class="col-status"></td>
    `;

    const select = document.createElement("select");
    select.className = "status-select";
    select.setAttribute("aria-label", "Status de " + c.nome);
    const opcoes = STATUS_DOACAO.includes(c.status) ? STATUS_DOACAO : [...STATUS_DOACAO, c.status];
    opcoes.forEach((s) => select.appendChild(new Option(s, s)));
    select.value = c.status;
    select.dataset.tom = tomDoStatus(c.status);

    select.addEventListener("change", () => {
      select.dataset.tom = tomDoStatus(select.value);
      atualizarContribuicao(c, select.value);
    });

    tr.querySelector(".col-status").appendChild(select);
    corpo.appendChild(tr);
  });
}

async function atualizarContribuicao(item, novoStatus) {
  item.status = novoStatus;
  renderizarResumoStatus();
  try {
    await Backend.atualizarStatus(item.aba, item.id, { status: novoStatus });
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

const selectStatusContrib = document.getElementById("filtro-status-contrib");
STATUS_DOACAO.forEach((s) => selectStatusContrib.appendChild(new Option(s, s)));
document.getElementById("filtro-tipo-contrib").addEventListener("change", (e) => {
  filtroContrib.tipo = e.target.value;
  renderizarContribuicoes();
});
selectStatusContrib.addEventListener("change", (e) => {
  filtroContrib.status = e.target.value;
  renderizarContribuicoes();
});

carregarPainel();
setInterval(carregarPainel, INTERVALO_ATUALIZACAO_MS);
