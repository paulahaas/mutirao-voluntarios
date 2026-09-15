# Mutirão Comunitário — Formulários, QR Codes e Painel de Voluntários

Site estático (HTML/CSS/JS puro, sem build) com 3 formulários de inscrição,
QR Codes prontos para divulgação, planilha do Google Sheets como banco de
dados e um painel de acompanhamento em tempo (quase) real.

## Estrutura do projeto

```
index.html          → página inicial (escolha entre os 3 formulários)
voluntario.html      → formulário "Quero ser voluntário"
parceiro.html         → formulário "Quero ser parceiro"
doador.html            → formulário "Quero contribuir"
qrcodes.html            → cartazes com QR Code de cada formulário
painel.html               → painel de acompanhamento do mutirão
config.js                   → TEXTOS, CORES-tema, listas (cursos, funções...) e endereços do backend
assets/styles.css             → sistema visual (cores, tipografia, componentes)
js/backend.js                   → comunicação com Google Sheets / Apps Script
js/form-common.js                 → lógica de envio compartilhada pelos formulários
js/dashboard.js                     → lógica do painel
apps-script/Code.gs                   → backend (cole no Google Apps Script)
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
3. Clique em **Implantar → Nova implantação**.
4. Em "Tipo", escolha **App da Web**.
5. Configure:
   - **Executar como:** Eu (sua conta Google)
   - **Quem pode acessar:** Qualquer pessoa
6. Clique em **Implantar**, autorize as permissões pedidas e copie a **URL do
   app da Web** gerada (termina em `/exec`).

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
disponibilidade, metas por função, responsáveis) também é editado ali —
veja os comentários dentro do arquivo.

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

Abra `painel.html` em um notebook, tablet ou projeção na recepção. Ele:

- Mostra total de inscritos, confirmados e presentes.
- Lista funções com déficit de gente (comparando com `metasPorFuncao` em `config.js`).
- Permite marcar **Confirmado** e **Presença** clicando direto na tabela —
  isso grava de volta na planilha.
- Tem filtros por curso, disponibilidade e função.
- Atualiza sozinho a cada 20 segundos (ajustável em `js/dashboard.js` →
  `INTERVALO_ATUALIZACAO_MS`).

Você também pode editar `Confirmado`/`Presenca` direto na planilha — o
painel vai refletir a mudança na próxima atualização automática.

## Personalizando textos, cores e listas

| O que trocar | Onde |
|---|---|
| Nome do evento, data, local, organização | `config.js` → `evento` |
| Cursos sugeridos, lista de funções, disponibilidade | `config.js` → `voluntario` |
| Tipos de parceria / contribuição | `config.js` → `parceiro` / `doador` |
| Metas e responsáveis por função (painel) | `config.js` → `metasPorFuncao` / `responsaveisPorFuncao` |
| Cores (tema claro e escuro), tipografia | `assets/styles.css` → bloco `:root` no topo do arquivo |

## Limitações conhecidas

- O envio dos formulários usa `fetch` em modo `no-cors`: o navegador não
  consegue confirmar se a gravação deu certo (limitação do Google Apps
  Script), então o formulário assume sucesso se a requisição não falhar
  por rede. Teste sempre um envio real antes do evento (passo 5).
- A planilha do Google tem um limite prático de algumas dezenas de milhares
  de linhas — mais do que suficiente para um mutirão, mas não use este
  modelo para bases muito grandes.
- Não há login/senha no painel: qualquer pessoa com o link consegue marcar
  presença. Para um evento maior, considere não divulgar o link do painel
  publicamente (ele não faz parte dos QR Codes de inscrição).
