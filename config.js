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
    organizacao: "Formulários, QR Codes e Voluntários",
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
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbytc_BdO4PFDUkt7zPcswpfuSoJzhXk4y3fFhkUGDyoYeoAMSxd2gqw-Y-e97qhMmL8yQ/exec",

    // ID da planilha do Google Sheets (fica no meio da URL da planilha,
    // entre /d/ e /edit). A planilha precisa estar compartilhada como
    // "Qualquer pessoa com o link → Leitor" para o painel conseguir ler.
    SHEET_ID: "1tVXdKz2i6mazq3CnaDdVvs0ks57V0_fydEnwpQVUzq8",

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
  SITE_BASE_URL: "https://mutirao-voluntarios.vercel.app",

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

    // Lista de cursos/área de formação (aparece como uma lista fixa no
    // formulário — evita que a mesma pessoa/curso apareça de formas
    // diferentes na planilha, tipo "Engenharia Civil" e "eng civil").
    // Uma opção "Outro" com campo de texto livre é adicionada
    // automaticamente no final, não precisa incluir aqui.
    cursosSugeridos: [
      "Administração",
      "Análise e Desenvolvimento de Sistemas",
      "Arquitetura e Urbanismo",
      "Ciência de Dados",
      "Direito",
      "Gestão Comercial",
      "Gestão de Negócios Imobiliários",
      "Gestão de Recursos Humanos",
      "Marketing",
      "Nutrição",
      "Produção Multimídia com Ênfase em Animação e Audiovisual",
      "Psicologia",
      "Segurança Cibernética",
      "UX Design",
    ],
  },

  // ================================================================
  // 5. LISTAS DO FORMULÁRIO "QUERO SER PARCEIRO"
  // ------------------------------------------------------------------
  // A pessoa pode marcar mais de um tipo de apoio (ex: uma loja de
  // tintas pode oferecer tanto "Tintas e insumos" quanto "Logística").
  // ================================================================
  parceiro: {
    tiposApoio: [
      "Tintas e insumos",
      "Ferramentas",
      "Materiais de proteção",
      "Impressão",
      "Comunicação",
      "Recursos financeiros",
      "Logística",
      "Estrutura",
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
  // 7. RESPONSÁVEL POR CADA FUNÇÃO — quem da organização coordena cada
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

  // ================================================================
  // 8. CÓDIGO DE ACESSO AO PAINEL
  // ------------------------------------------------------------------
  // O painel pede esse código antes de mostrar os dados dos
  // voluntários. IMPORTANTE: isso NÃO é segurança de verdade — o
  // código fica visível para quem souber olhar o código-fonte da
  // página. Serve só para impedir que alguém abra o link do painel
  // por acaso e comece a mexer sem querer. Troque para o código que
  // preferir (pode ser texto ou números). Deixe "" para desativar
  // essa tela e liberar o painel direto.
  // ================================================================
  painel: {
    pin: "mutirao2026",
  },

  // ================================================================
  // 9. SOBRE NÓS / INSTITUIÇÃO — aparece num rodapé em todas as
  // páginas, inclusive nas que o QR Code leva direto (voluntário,
  // parceiro, doador). Existe porque quem recebe o link encaminhado
  // por terceiros pode não ter contexto nenhum sobre o projeto — essa
  // seção existe pra dar confiança de que é um projeto real e não
  // golpe, principalmente pra quem for doar.
  //
  // TROQUE o texto abaixo pelo texto real de vocês (nome da
  // instituição, curso/disciplina, o que é o projeto).
  //
  // Para a logo: coloque o arquivo de imagem dentro da pasta assets/
  // (ex: assets/logo-instituicao.png) e escreva o caminho em `logo`
  // abaixo. Deixe `logo: ""` para não mostrar nenhuma imagem (só o
  // texto aparece).
  // ================================================================
  instituicao: {
    // Deixe "false" para esconder o rodapé inteiro. Troque para
    // "true" quando estiver pronto.
    ativo: true,

    nome: "Floripa + Cor",
    // Logo extraída do material de marca (não havia versão isolada em
    // vetor). Troque pelo arquivo oficial da UniCesusc se/quando tiver
    // um separado — ex: "assets/logo-unicesusc.png".
    logo: "assets/logo-floripa-cor.png",
    descricao:
      "Este projeto é uma iniciativa de extensão do Grupo 02, ligada " +
      "à disciplina R+Cidades da UniCesusc e ao projeto Floripa + Cor " +
      "na Comunidade. Se você recebeu este link de alguém, pode ficar " +
      "tranquilo: é um projeto real, ligado à instituição de ensino.",
    // Opcional: link para o Instagram/site da instituição ou do grupo,
    // pra quem quiser confirmar que o projeto existe de verdade antes
    // de doar. Deixe "" para não mostrar o link.
    link: "",
  },
};
