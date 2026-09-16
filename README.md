# Mutirão Comunitário — Formulários, QR Codes e Painel de Voluntários

## Sobre o projeto

Este projeto foi criado para facilitar a organização de um **mutirão
comunitário** (ação social): desde a inscrição de voluntários, parceiros e
doadores, até o acompanhamento de quem confirmou presença no dia do evento.

Antes, esse tipo de inscrição costuma ficar espalhada em conversas de
WhatsApp, formulários soltos e planilhas preenchidas manualmente. Aqui,
tudo fica centralizado e automático: a pessoa preenche um formulário no
celular (inclusive escaneando um QR Code num cartaz), o cadastro cai sozinho
numa planilha, e a organização acompanha tudo em um painel único — sem
precisar copiar nada à mão.

**🔗 Site publicado:** https://mutirao-voluntarios.vercel.app
**📊 Planilha com os dados (voluntários, parceiros, doadores):** [abrir no Google Sheets](https://docs.google.com/spreadsheets/d/1tVXdKz2i6mazq3CnaDdVvs0ks57V0_fydEnwpQVUzq8/edit)

### O que tem no site

| Página | O que faz |
|---|---|
| **Início** | Ponto de entrada — a pessoa escolhe se quer ser voluntária, parceira ou doadora. |
| **Quero ser voluntário** | Formulário de inscrição (nome, curso, disponibilidade, função de interesse etc.). |
| **Quero ser parceiro** | Formulário para empresas/instituições que querem apoiar o mutirão. |
| **Quero contribuir** | Formulário de doações (dinheiro, materiais, alimentos). |
| **QR Codes** | Um cartaz pronto para impressão/redes sociais para cada formulário (e um extra pro check-in), com o QR Code já apontando pro link certo. |
| **Painel** | Os números gerais (inscritos, confirmados, compareceram) são públicos; a lista de voluntários e o detalhe por função ficam atrás de um código de acesso. |
| **Check-in** | Lista de voluntários pra marcar presença com um toque no dia do evento — pensada pra ser rápida, sem código de acesso. |

### Como os dados fluem

1. Alguém escaneia um QR Code (ou acessa o link direto) e preenche um formulário.
2. O envio cai automaticamente numa aba da planilha do Google Sheets — sem
   nenhuma digitação manual — e a pessoa recebe um e-mail confirmando o
   recebimento.
3. O painel lê essa planilha em tempo quase real e mostra os números
   atualizados.
4. No dia do mutirão, a organização marca "Confirmado" e "Presença" direto
   no painel, ou usa a página de **check-in** pra marcar presença rapidamente
   conforme as pessoas chegam — e isso é a única parte manual, de propósito,
   porque exige uma decisão de alguém da equipe.

---

## Estrutura do projeto (documentação técnica)

*A partir daqui o conteúdo é mais técnico — útil para quem for configurar ou
dar manutenção no projeto.*

```
index.html          → página inicial (escolha entre os 3 formulários)
voluntario.html      → formulário "Quero ser voluntário"
parceiro.html         → formulário "Quero ser parceiro"
doador.html            → formulário "Quero contribuir"
qrcodes.html            → cartazes com QR Code de cada formulário (+ check-in)
painel.html               → painel de acompanhamento (números públicos + detalhes com PIN)
checkin.html                → check-in de presença no dia do evento
config.js                     → TEXTOS, CORES-tema, listas (cursos, funções...) e endereços do backend
assets/styles.css                → sistema visual (cores, tipografia, componentes)
js/backend.js                       → comunicação com Google Sheets / Apps Script
js/form-common.js                     → lógica de envio compartilhada pelos formulários
js/dashboard.js                         → lógica do painel
js/checkin.js                             → lógica do check-in
js/footer.js                                → preenche o rodapé "Sobre nós"
apps-script/Code.gs                            → backend (cole no Google Apps Script)
```

## 1. Configurando o banco de dados (Google Sheets)

1. Crie uma planilha nova no [Google Sheets](https://sheets.new).
2. Renomeie a primeira aba para `voluntarios` e cole esta linha de cabeçalho na linha 1:
   ```
   ID	Timestamp	Nome	Curso	Email	Telefone	Disponibilidade	Funcao	JaParticipou	Observacoes	Confirmado	Presenca
   ```
3. Crie outra aba chamada `parceiros` com o cabeçalho:
   ```
   ID	Timestamp	Empresa	Responsavel	Email	Telefone	TipoParceria	Descricao	Observacoes
   ```
4. Crie outra aba chamada `doadores` com o cabeçalho:
   ```
   ID	Timestamp	Nome	Email	Telefone	TipoContribuicao	Descricao	Observacoes
   ```
5. Clique em **Compartilhar** → mude para **"Qualquer pessoa com o link"** → papel **Leitor**.
   Isso é necessário para o painel conseguir ler os dados. Ninguém consegue
   editar a planilha por esse link — só o backend (passo 2) grava nela.

## 2. Publicando o backend (Google Apps Script)

1. Na própria planilha, vá em **Extensões → Apps Script**.
2. Apague o código de exemplo e cole todo o conteúdo de [`apps-script/Code.gs`](apps-script/Code.gs).
3. No topo do arquivo, troque `EMAIL_ORGANIZACAO` pelo e-mail que deve
   receber o aviso de "nova doação em dinheiro".
4. Clique em **Implantar → Nova implantação**.
5. Em "Tipo", escolha **App da Web**.
6. Configure:
   - **Executar como:** Eu (sua conta Google)
   - **Quem pode acessar:** Qualquer pessoa
7. Clique em **Implantar**, autorize as permissões pedidas (o script precisa
   de permissão pra enviar e-mail, usada nas confirmações automáticas) e
   copie a **URL do app da Web** gerada (termina em `/exec`).

> Sempre que você editar o `Code.gs`, é preciso implantar uma **nova versão**
> (Implantar → Gerenciar implantações → ✏️ → Nova versão) para as mudanças
> valerem.

## 3. Configurando o site (`config.js`)

Abra `config.js` e preencha:

- `backend.APPS_SCRIPT_URL` → a URL copiada no passo anterior.
- `backend.SHEET_ID` → o trecho da URL da planilha entre `/d/` e `/edit`.
  Exemplo: em `https://docs.google.com/spreadsheets/d/1AbCdEfGhIj/edit`,
  o ID é `1AbCdEfGhIj`.

Todo o resto do arquivo (nome do evento, listas de cursos/funções,
disponibilidade, responsáveis por função, texto "Sobre nós") também é
editado ali — veja os comentários dentro do arquivo.

## 4. Publicando o site

Qualquer serviço de hospedagem de site estático funciona, sem nenhuma
configuração especial (não há build, é HTML puro). Sugestões gratuitas:

- **[Vercel](https://vercel.com/new)** — arraste a pasta do projeto ou conecte o repositório Git.
- **[Netlify Drop](https://app.netlify.com/drop)** — arraste a pasta do projeto no navegador.
- **GitHub Pages** — suba o repositório e ative Pages nas configurações.

Depois de publicado, copie a URL final e cole em `config.js` →
`SITE_BASE_URL` (sem barra no final). Isso é o que faz os QR Codes
apontarem para o endereço certo.

## 5. Gerando e testando os QR Codes

Abra `qrcodes.html` no site publicado. Os 3 QR Codes são gerados
automaticamente a partir de `SITE_BASE_URL` + o arquivo de cada formulário.
Use o botão **Imprimir cartazes** para gerar uma versão pronta para impressão
(um cartaz por página) ou tire um print de cada um para postar nas redes.

**Teste sempre antes de divulgar:** escaneie cada QR Code com o celular,
preencha um envio de teste e confira se a linha apareceu na planilha.

## 6. Usando o painel no dia do mutirão

Os três números do topo (inscritos, confirmados, compareceram) são
**públicos** — qualquer um que abrir `painel.html` já vê. Pra ver a lista de
voluntários e a contagem por função, é preciso digitar um **código de
acesso** (definido em `config.js` → `painel.pin`, padrão `mutirao2026` —
troque para o código que preferir). Não é uma senha forte — só evita que
alguém abra o link por acaso. Depois de digitar certo uma vez, o navegador
lembra e não pede de novo.

Abra `painel.html` em um notebook, tablet ou projeção na recepção. Depois de
destravar com o código, ele:

- Lista quantas pessoas se inscreveram em cada função (sem limite — quanto
  mais gente, melhor).
- Permite marcar **Confirmado** e **Presença** clicando direto na tabela —
  isso grava de volta na planilha.
- Tem filtros por curso, disponibilidade e função.
- Atualiza sozinho a cada 20 segundos (ajustável em `js/dashboard.js` →
  `INTERVALO_ATUALIZACAO_MS`).

Você também pode editar `Confirmado`/`Presenca` direto na planilha — o
painel vai refletir a mudança na próxima atualização automática.

## 7. Check-in de presença no dia do evento

`checkin.html` é uma lista simples de voluntários com um botão "Marcar
presença" em cada linha — feita pra ser rápida na entrada do evento, sem
pedir código de acesso (só marca presença, não mostra e-mail/telefone de
ninguém). Tem um campo de busca por nome pra achar a pessoa rápido numa
lista grande. Pode ser usada pela própria pessoa (escaneando o QR Code de
check-in) ou por alguém da recepção com um tablet/celular.

## Personalizando textos, cores e listas

| O que trocar | Onde |
|---|---|
| Nome do evento, data, local, organização | `config.js` → `evento` |
| Cursos sugeridos, lista de funções, disponibilidade | `config.js` → `voluntario` |
| Tipos de parceria / contribuição | `config.js` → `parceiro` / `doador` |
| Responsáveis por função (painel) | `config.js` → `responsaveisPorFuncao` |
| Código de acesso do painel | `config.js` → `painel.pin` |
| Texto/logo do rodapé "Sobre nós" | `config.js` → `instituicao` (`ativo: true` pra mostrar) |
| E-mail que recebe aviso de doação em dinheiro | `apps-script/Code.gs` → `EMAIL_ORGANIZACAO` |
| Cores (tema claro e escuro), tipografia | `assets/styles.css` → bloco `:root` no topo do arquivo |

## Limitações conhecidas

- O envio dos formulários usa `fetch` em modo `no-cors` (limitação do Google
  Apps Script — o navegador não consegue ler a resposta). Para compensar, o
  site confere sozinho se o registro apareceu na planilha antes de avisar
  "sucesso" — mas isso ainda depende da planilha estar acessível para
  leitura pública. Teste sempre um envio real antes do evento (passo 5).
- A planilha do Google tem um limite prático de algumas dezenas de milhares
  de linhas — mais do que suficiente para um mutirão, mas não use este
  modelo para bases muito grandes.
- O código de acesso do painel (`painel.pin`) é uma proteção simples, não
  criptografia de verdade — qualquer pessoa que abrir o "ver código-fonte"
  da página consegue encontrá-lo. Serve para evitar acesso casual, não para
  proteger dados sensíveis de verdade.
- `checkin.html` não pede código de acesso (de propósito, pra ser rápido no
  dia do evento) — qualquer pessoa com o link consegue marcar presença de
  qualquer voluntário. Ele só mostra nome e função, não e-mail/telefone.
- Os e-mails automáticos (confirmação de inscrição e aviso de doação em
  dinheiro) usam `MailApp` do Google, que tem um limite diário (cerca de
  100 e-mails/dia numa conta pessoal do Gmail) — mais que suficiente pra um
  mutirão comum, mas fique de olho se o evento for muito grande.
