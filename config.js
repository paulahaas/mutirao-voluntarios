/**
 * CONFIGURAÇÃO GERAL DO PROJETO
 * ------------------------------------------------------------------
 * Este é o ÚNICO arquivo que a maioria das pessoas vai precisar editar.
 * Troque os valores abaixo para adaptar o site ao seu mutirão: nome do
 * evento, link da planilha, listas de cursos/funções, textos, etc.
 *
 * Depois de editar, salve o arquivo — todas as páginas (formulários,
 * QR Codes e painel) leem os valores daqui.
 * ------------------------------------------------------------------
 */

const CONFIG = {

  // ================================================================
  // 1. IDENTIDADE DO EVENTO — textos usados nas páginas e nos QR Codes
  // ================================================================
  evento: {
    nome: "Mutirão Comunitário",
    organizacao: "Grupo 02 — Formulários, QR Codes e Voluntários",
    dataLocal: "Sábado, 08h às 17h — [defina data e local aqui]",
    corTema: "pine", // usado só como referência; cores reais ficam em assets/styles.css
  },

  // ================================================================
  // 2. ENDEREÇOS DE BACKEND (Google Sheets + Apps Script)
  // ------------------------------------------------------------------
  // Veja o passo a passo completo em README.md → "Configurando o banco
  // de dados (Google Sheets)". Depois de publicar o Apps Script como
  // Web App, cole a URL gerada em APPS_SCRIPT_URL abaixo.
  // ================================================================
  backend: {
    // URL do Web App publicado no Google Apps Script (recebe os envios
    // dos 3 formulários e as atualizações de presença do painel).
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/SUBSTITUA_PELO_SEU_ID/exec",

    // ID da planilha do Google Sheets (fica no meio da URL da planilha,
    // entre /d/ e /edit). A planilha precisa estar compartilhada como
    // "Qualquer pessoa com o link → Leitor" para o painel conseguir ler.
    SHEET_ID: "SUBSTITUA_PELO_ID_DA_SUA_PLANILHA",

    // Nomes das abas dentro da planilha (não precisa mudar se você usar
    // o modelo pronto descrito no README).
    ABA_VOLUNTARIOS: "voluntarios",
    ABA_PARCEIROS: "parceiros",
    ABA_DOADORES: "doadores",
  },

  // ================================================================
  // 3. ENDEREÇO PÚBLICO DO SITE — usado para montar os links dos QR Codes
  // ------------------------------------------------------------------
  // Antes de publicar o site (Vercel, Netlify, GitHub Pages...), deixe
  // em branco: a página de QR Codes vai te avisar. Depois de publicar,
  // cole aqui a URL final, sem barra no final.
  // Ex: "https://mutirao-voluntarios.vercel.app"
  // ================================================================
  SITE_BASE_URL: "",

  // ================================================================
  // 4. LISTAS DO FORMULÁRIO "QUERO SER VOLUNTÁRIO"
  // ================================================================
  voluntario: {
    disponibilidade: [
      { valor: "manha", rotulo: "Manhã" },
      { valor: "tarde", rotulo: "Tarde" },
      { valor: "dia_todo", rotulo: "Dia todo" },
    ],

    // Lista fixa de funções sugeridas. O formulário também tem um campo
    // "Outra função" caso a pessoa queira digitar algo fora da lista.
    funcoes: [
      "Pintura",
      "Organização e limpeza",
      "Logística e transporte",
      "Recepção e cadastro",
      "Comunicação e redes sociais",
      "Cozinha e alimentação",
      "Cuidado com crianças",
      "Montagem de estruturas",
      "Primeiros socorros",
    ],

    // Sugestões de curso/área (aparecem como autocomplete, mas o campo
    // aceita qualquer texto digitado).
    cursosSugeridos: [
      "Administração",
      "Arquitetura",
      "Direito",
      "Enfermagem",
      "Engenharia Civil",
      "Medicina",
      "Pedagogia",
      "Psicologia",
      "Serviço Social",
      "Outro / Não se aplica",
    ],
  },

  // ================================================================
  // 5. LISTAS DO FORMULÁRIO "QUERO SER PARCEIRO"
  // ================================================================
  parceiro: {
    tiposParceria: [
      "Financeira",
      "Material (doação de itens)",
      "Divulgação",
      "Mão de obra / voluntariado da equipe",
      "Espaço / infraestrutura",
      "Outro",
    ],
  },

  // ================================================================
  // 6. LISTAS DO FORMULÁRIO "QUERO CONTRIBUIR"
  // ================================================================
  doador: {
    tiposContribuicao: [
      "Dinheiro",
      "Materiais de construção",
      "Alimentos",
      "Roupas e itens de higiene",
      "Outro",
    ],
  },

  // ================================================================
  // 7. META DE PESSOAS POR FUNÇÃO — usado no painel para calcular
  // déficit ("precisa de mais gente em: X, Y"). Ajuste os números para
  // o tamanho real do seu mutirão. Funções fora desta lista ainda
  // aparecem no painel, só não entram no cálculo de déficit.
  // ================================================================
  metasPorFuncao: {
    "Pintura": 8,
    "Organização e limpeza": 6,
    "Logística e transporte": 4,
    "Recepção e cadastro": 3,
    "Comunicação e redes sociais": 2,
    "Cozinha e alimentação": 5,
    "Cuidado com crianças": 3,
    "Montagem de estruturas": 6,
    "Primeiros socorros": 2,
  },

  // ================================================================
  // 8. RESPONSÁVEL POR CADA FUNÇÃO — quem da organização coordena cada
  // atividade no dia do mutirão. Aparece no painel ao lado da barra de
  // preenchimento de cada função. Deixe "" se ainda não tiver definido.
  // ================================================================
  responsaveisPorFuncao: {
    "Pintura": "",
    "Organização e limpeza": "",
    "Logística e transporte": "",
    "Recepção e cadastro": "",
    "Comunicação e redes sociais": "",
    "Cozinha e alimentação": "",
    "Cuidado com crianças": "",
    "Montagem de estruturas": "",
    "Primeiros socorros": "",
  },
};
