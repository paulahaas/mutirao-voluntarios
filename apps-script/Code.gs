/**
 * BACKEND DO MUTIRÃO — Google Apps Script
 * ------------------------------------------------------------------
 * Este script recebe os envios dos formulários (voluntário, parceiro,
 * doador) e as atualizações de presença feitas no painel/check-in, e
 * grava tudo na planilha do Google Sheets a que ele está vinculado.
 * Também manda um e-mail de confirmação pra quem se inscreve e avisa
 * a organização quando chega uma doação em dinheiro.
 *
 * COMO INSTALAR (passo a passo completo também está no README.md):
 *   1. Crie uma planilha no Google Sheets com 3 abas chamadas
 *      "voluntarios", "parceiros" e "doadores", cada uma com a
 *      primeira linha de cabeçalhos indicada abaixo.
 *   2. Na planilha, vá em Extensões → Apps Script.
 *   3. Apague o conteúdo padrão e cole todo este arquivo.
 *   4. Troque EMAIL_ORGANIZACAO abaixo pelo e-mail que deve receber o
 *      aviso de doação em dinheiro.
 *   5. Clique em Implantar → Nova implantação → tipo "Web app".
 *      - Executar como: Eu (sua conta)
 *      - Quem pode acessar: Qualquer pessoa
 *   6. Copie a URL gerada e cole em config.js → backend.APPS_SCRIPT_URL
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

// E-mail da organização que recebe o aviso de "nova doação em
// dinheiro". Troque pelo e-mail real da equipe.
const EMAIL_ORGANIZACAO = "SUBSTITUA_PELO_EMAIL_DA_ORGANIZACAO@exemplo.com";

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
      enviarConfirmacao(body.sheet, body.data);
      notificarDoacaoDinheiro(body.sheet, body.data);
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

// E-mail automático de confirmação pra quem preencheu o formulário.
// Se o envio de e-mail falhar por qualquer motivo, não interrompe o
// cadastro — a linha já foi gravada na planilha de qualquer jeito.
function enviarConfirmacao(sheetName, d) {
  if (!d.email) return;

  let assunto = "";
  let corpo = "";

  if (sheetName === "voluntarios") {
    assunto = "Recebemos sua inscrição de voluntário!";
    corpo =
      "Oi " + d.nome + ",\n\n" +
      "Recebemos sua inscrição para o mutirão (função de interesse: " + d.funcao + "). " +
      "A organização vai entrar em contato para confirmar sua participação.\n\n" +
      "Obrigado por fazer parte!";
  } else if (sheetName === "parceiros") {
    assunto = "Recebemos seu cadastro de parceria!";
    corpo =
      "Oi " + d.responsavel + ",\n\n" +
      "Recebemos o cadastro de parceria da empresa " + d.empresa + ". " +
      "A organização vai entrar em contato em breve para combinar os detalhes.\n\n" +
      "Obrigado pelo apoio!";
  } else if (sheetName === "doadores") {
    assunto = "Recebemos sua doação!";
    corpo =
      "Oi " + d.nome + ",\n\n" +
      "Recebemos o registro da sua doação (" + d.tipoContribuicao + "). " +
      "A organização vai entrar em contato para combinar a entrega ou coleta.\n\n" +
      "Obrigado por contribuir!";
  } else {
    return;
  }

  try {
    MailApp.sendEmail(d.email, assunto, corpo);
  } catch (erro) {
    // Ignorado de propósito — falha no e-mail não deve derrubar o cadastro.
  }
}

// Avisa a organização por e-mail quando chega uma doação em DINHEIRO
// especificamente (não pra materiais/alimentos/etc — só pra ter
// noção rápida de doações financeiras).
function notificarDoacaoDinheiro(sheetName, d) {
  if (sheetName !== "doadores") return;
  if (String(d.tipoContribuicao) !== "Dinheiro") return;
  if (!EMAIL_ORGANIZACAO || EMAIL_ORGANIZACAO.indexOf("SUBSTITUA") > -1) return;

  const corpo =
    "Nova doação em dinheiro registrada!\n\n" +
    "Nome: " + d.nome + "\n" +
    "E-mail: " + d.email + "\n" +
    "Telefone: " + d.telefone + "\n" +
    "Descrição: " + d.descricao;

  try {
    MailApp.sendEmail(EMAIL_ORGANIZACAO, "Nova doação em dinheiro — Mutirão", corpo);
  } catch (erro) {
    // Ignorado de propósito.
  }
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
