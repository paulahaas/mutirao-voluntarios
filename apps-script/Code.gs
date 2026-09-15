/**
 * BACKEND DO MUTIRÃO — Google Apps Script
 * ------------------------------------------------------------------
 * Este script recebe os envios dos formulários (voluntário, parceiro,
 * doador) e as atualizações de presença feitas no painel, e grava tudo
 * na planilha do Google Sheets a que ele está vinculado.
 *
 * COMO INSTALAR (passo a passo completo também está no README.md):
 *   1. Crie uma planilha no Google Sheets com 3 abas chamadas
 *      "voluntarios", "parceiros" e "doadores", cada uma com a
 *      primeira linha de cabeçalhos indicada abaixo.
 *   2. Na planilha, vá em Extensões → Apps Script.
 *   3. Apague o conteúdo padrão e cole todo este arquivo.
 *   4. Clique em Implantar → Nova implantação → tipo "Web app".
 *      - Executar como: Eu (sua conta)
 *      - Quem pode acessar: Qualquer pessoa
 *   5. Copie a URL gerada e cole em config.js → backend.APPS_SCRIPT_URL
 *
 * CABEÇALHOS ESPERADOS (linha 1 de cada aba):
 *   voluntarios: ID | Timestamp | Nome | Curso | Email | Telefone |
 *                Disponibilidade | Funcao | JaParticipou |
 *                Observacoes | Confirmado | Presenca
 *   parceiros:   ID | Timestamp | Empresa | Responsavel | Email |
 *                Telefone | TipoParceria | Descricao | Observacoes
 *   doadores:    ID | Timestamp | Nome | Email | Telefone |
 *                TipoContribuicao | Descricao | Observacoes
 * ------------------------------------------------------------------
 */

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(body.sheet);

    if (!sheet) {
      return jsonOut({ ok: false, error: "Aba '" + body.sheet + "' não encontrada." });
    }

    if (body.action === "create") {
      sheet.appendRow(buildRow(body.sheet, body.data));
      return jsonOut({ ok: true });
    }

    if (body.action === "updateStatus") {
      return jsonOut(atualizarLinha(sheet, body));
    }

    return jsonOut({ ok: false, error: "Ação desconhecida: " + body.action });
  } catch (erro) {
    return jsonOut({ ok: false, error: String(erro) });
  }
}

// Monta a linha na ordem exata das colunas de cada aba.
function buildRow(sheetName, d) {
  const agora = new Date();

  if (sheetName === "voluntarios") {
    return [
      d.id, agora, d.nome, d.curso, d.email, d.telefone,
      d.disponibilidade, d.funcao, d.jaParticipou, d.observacoes,
      "", "", // Confirmado, Presenca — preenchidos depois pela organização
    ];
  }

  if (sheetName === "parceiros") {
    return [d.id, agora, d.empresa, d.responsavel, d.email, d.telefone, d.tipoParceria, d.descricao, d.observacoes];
  }

  if (sheetName === "doadores") {
    return [d.id, agora, d.nome, d.email, d.telefone, d.tipoContribuicao, d.descricao, d.observacoes];
  }

  throw new Error("Aba sem mapeamento de colunas: " + sheetName);
}

// Localiza a linha pelo ID (coluna A) e atualiza Confirmado e/ou Presenca.
function atualizarLinha(sheet, body) {
  const dados = sheet.getDataRange().getValues();
  const headers = dados[0];
  const colConfirmado = headers.indexOf("Confirmado");
  const colPresenca = headers.indexOf("Presenca");

  for (let i = 1; i < dados.length; i++) {
    if (String(dados[i][0]) === String(body.id)) {
      const linhaPlanilha = i + 1;
      if (body.confirmado !== undefined && colConfirmado > -1) {
        sheet.getRange(linhaPlanilha, colConfirmado + 1).setValue(body.confirmado);
      }
      if (body.presenca !== undefined && colPresenca > -1) {
        sheet.getRange(linhaPlanilha, colPresenca + 1).setValue(body.presenca);
      }
      return { ok: true };
    }
  }
  return { ok: false, error: "ID não encontrado: " + body.id };
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Só para testar rapidamente se a implantação está no ar: abrir a URL
// do Web App direto no navegador deve mostrar esta mensagem.
function doGet() {
  return ContentService
    .createTextOutput("Backend do mutirão está no ar. Use POST para enviar dados.")
    .setMimeType(ContentService.MimeType.TEXT);
}
