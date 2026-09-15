/**
 * CAMADA DE ACESSO AOS DADOS
 * ------------------------------------------------------------------
 * Toda a comunicação com a planilha do Google passa por aqui.
 *
 * ESCRITA (novos cadastros e atualização de presença): manda um POST
 * para o Web App do Google Apps Script (veja apps-script/Code.gs).
 * Usamos `mode: "no-cors"` de propósito — Apps Script não responde aos
 * cabeçalhos CORS que o navegador exige para ler a resposta, então não
 * conseguimos ler o retorno, só confirmar que a requisição foi enviada.
 * Isso é seguro aqui porque não há nada sensível sendo lido de volta.
 * Para os formulários, `confirmarChegada` compensa essa limitação
 * procurando o registro recém-criado na planilha antes de avisar a
 * pessoa que deu certo.
 *
 * LEITURA (painel): usa a API pública do Google Visualization
 * ("gviz"), que lê diretamente a planilha publicada como JSON, sem
 * precisar do Apps Script. Por isso a planilha precisa estar
 * compartilhada como "Qualquer pessoa com o link → Leitor".
 * ------------------------------------------------------------------
 */

const Backend = (() => {
  function gerarId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  async function enviarFormulario(sheet, dados) {
    const url = CONFIG.backend.APPS_SCRIPT_URL;
    if (!url || url.includes("SUBSTITUA")) {
      throw new Error(
        "O link do Apps Script ainda não foi configurado em config.js (backend.APPS_SCRIPT_URL)."
      );
    }
    const id = gerarId();
    const payload = { action: "create", sheet, data: { id, ...dados } };

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return id;
  }

  // Como o envio usa "no-cors", não dá pra saber pela resposta se a
  // gravação deu certo. Em vez de confiar cegamente, procuramos o ID
  // recém-criado na planilha por alguns segundos antes de considerar
  // o envio confirmado.
  async function confirmarChegada(sheet, id, tentativas = 5, intervaloMs = 1200) {
    for (let i = 0; i < tentativas; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervaloMs));
      try {
        const linhas = await lerAba(sheet);
        if (linhas.some((linha) => linha.ID === id)) return true;
      } catch (erro) {
        // Se a leitura falhar (ex: rede instável), só tenta de novo.
      }
    }
    return false;
  }

  async function atualizarStatus(sheet, id, campos) {
    const url = CONFIG.backend.APPS_SCRIPT_URL;
    if (!url || url.includes("SUBSTITUA")) {
      throw new Error("APPS_SCRIPT_URL não configurado.");
    }
    const payload = { action: "updateStatus", sheet, id, ...campos };
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  // Lê uma aba inteira da planilha via gviz e devolve um array de
  // objetos { NomeDaColuna: valor }, usando a primeira linha como
  // cabeçalho.
  async function lerAba(sheetName) {
    const { SHEET_ID } = CONFIG.backend;
    if (!SHEET_ID || SHEET_ID.includes("SUBSTITUA")) {
      throw new Error("SHEET_ID não configurado em config.js.");
    }
    // headers=1 força a 1ª linha a ser tratada como cabeçalho mesmo
    // quando a planilha ainda não tem nenhuma linha de dados (sem
    // isso, o Google às vezes "adivinha" errado e devolve o próprio
    // cabeçalho como se fosse um registro).
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
      `?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        "Não foi possível ler a planilha (verifique se ela está " +
          "compartilhada como 'Qualquer pessoa com o link → Leitor')."
      );
    }
    const texto = await res.text();

    // A resposta vem embrulhada em algo como:
    // google.visualization.Query.setResponse({...});
    const match = texto.match(/setResponse\((.*)\);?\s*$/s);
    if (!match) throw new Error("Formato inesperado na resposta da planilha.");
    const json = JSON.parse(match[1]);

    const colunas = json.table.cols.map((c) => c.label || c.id);
    const linhas = json.table.rows || [];

    return linhas
      .map((linha) => {
        const obj = {};
        colunas.forEach((nomeColuna, i) => {
          const celula = linha.c && linha.c[i];
          obj[nomeColuna] = celula ? celula.f ?? celula.v ?? "" : "";
        });
        return obj;
      })
      // A planilha às vezes reporta uma linha "fantasma" totalmente vazia
      // (resíduo de formatação após excluir linhas). Ignoramos qualquer
      // linha sem nenhum valor preenchido.
      .filter((obj) => Object.values(obj).some((v) => String(v).trim() !== ""));
  }

  return { enviarFormulario, atualizarStatus, lerAba, confirmarChegada };
})();
