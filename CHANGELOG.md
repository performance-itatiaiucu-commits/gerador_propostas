# 📝 CHANGELOG — Histórico de Versões

Baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e [SemVer](https://semver.org/lang/pt-BR/).

---

## [3.0.11] — 2026-08-21 — Assinaturas do preview passam a valer no PDF (motor de render atualizado)

### 🐛 Corrigido
- **As assinaturas configuradas não apareciam no PDF baixado**: o preview mostrava os dois blocos (rótulo, linha para rubrica e nome), mas o PDF final saía sem as linhas de assinatura e sem o bloco da empresa cliente. Causa raiz: o `html2pdf.js` 0.10.1 carregado do CDN embute o **html2canvas 1.0.0 (2021)**, que **não renderiza colunas de CSS Grid** — a grade `.doc-signatures` (2 colunas) perdia a segunda coluna inteira e as linhas de rubrica. A troca do bundle para o **0.14.0** (que embute o **html2canvas 1.4.1**) faz o PDF renderizar exatamente o que o preview mostra: as duas linhas de assinatura lado a lado e os nomes configurados (**Performance Ocupacional** e **empresa cliente**) abaixo delas.
- **Grades de informações do cliente colapsavam no PDF**: a janela de captura do html2canvas tem 680px de largura, o que ativava o breakpoint responsivo de 900px e empilhava **todas** as grades `.doc-kv` do documento (dados do cliente, CNPJ/Endereço/Cidade-UF e Forma de Pagamento/Prazo de Entrega) em uma coluna — o PDF divergia do preview exibido na tela. A v3.0.9 já protegia a grade `.doc-signatures`; agora a mesma garantia (`grid-template-columns: repeat(2, minmax(0,1fr))`) cobre `.doc-kv` no alvo de exportação e no fallback de impressão nativa.
- Verificação ponta a ponta em navegador real: o PDF gerado pelo fluxo de download efetivo contém as duas linhas de assinatura (traços de 558px lado a lado na largura útil) com os nomes configurados abaixo, tanto em propostas curtas (assinaturas na mesma página) quanto em propostas longas com paginação e quebra forçada antes do cartão; rodapé “Página X de Y” e metadados seguem íntegros com o jsPDF do novo bundle.

### 🔄 Alterado
- `html2pdf.js` no CDN: `0.10.1` → **`0.14.0`** (cdnjs). O plugin de quebra de páginas é idêntico entre as versões — todo o ajuste fino de paginação das v3.0.7–3.0.10 permanece válido; muda apenas o motor de captura (html2canvas 1.0.0 → 1.4.1) e o jsPDF (2.x → 4.x, APIs usadas pelo carimbo de rodapé verificadas).
- Cache busting `?v=3.0.11` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.

### ✅ Testes
- Novos casos de regressão: o `index.html` referencia o bundle 0.14.0 (e nunca mais 0.10.x, cujo motor descartava colunas de grid), e o CSS de exportação/impressão mantém `.doc-kv` em duas colunas.
- Suíte atualizada para `v3.0.11`.

---

## [3.0.10] — 2026-08-21 — Quebra de página: cartão de assinaturas intacto e tabela protegida

### 🐛 Corrigido
- **Cartão de assinaturas rasgado + página quase em branco**: quando a quebra condicional disparava (proposta em que as assinaturas não cabiam no restante da página), o alvo era a grade interna `.doc-signatures` — que vive **dentro** do cartão `.sig-form` (título + descrição + grade). O plugin de quebra do html2pdf percorre os elementos em ordem de documento: primeiro empurrava o cartão inteiro pelo `avoid` e, em seguida, aplicava o `before` na grade — **dois espaçadores**, o segundo com ~930 px **dentro** do cartão. O PDF saía com uma página contendo só o topo do cartão e um vazio enorme, e as linhas de assinatura na página seguinte. A medida e a quebra agora miram o **cartão `.sig-form` inteiro**: um único espaçador, e o cartão (título + descrição + assinaturas) começa intacto no topo da página nova.
- **Linhas da tabela de itens fatiadas ao meio**: em propostas longas, o fim de página podia cortar uma linha do `<tbody>` no meio do texto. O plugin do html2pdf não pode proteger `<tr>` (inseriria `<div>` inválida dentro do `<tbody>` — o bug dos “buracos” da v3.0.5). Solução: medição própria (`protectItemsTableAgainstSplitRows`) que insere `<tr class="pdf-page-spacer">` **válidos** com a altura exata do espaço restante da página, empurrando cada linha que cruzaria o corte para o topo da página seguinte. O `<thead>` recebe o mesmo cuidado via espaçador `<div>` **fora** da tabela (onde `<div>` é válida). Os espaçadores são removidos no `finally`, junto com as classes de exportação — o preview nunca fica sujo.
- **Rodapé do documento (`.doc-footer`) protegido**: entrou na lista `avoid` do html2pdf e nas regras de `page-break-inside: avoid` de exportação e de impressão — não é mais fatiado no meio do texto.

### ✅ Testes
- Novos casos unitários: a quebra mira `.sig-form` (e nunca mais `.doc-signatures`), matemática de `rowCrossesPageBreak` (cabe/cruza/limite exato/2ª página/linha gigante/sem medida), espaçadores `<tr>` válidos com `colSpan`, ordem “espaçadores → medida” e limpeza no `finally`, `.doc-footer` protegido na exportação e na impressão.
- Novo caso de integração (jsdom, geometria simulada): a linha que cruza o fim da página recebe exatamente um espaçador `<tr class="pdf-page-spacer">` com `colspan`, o cartão de assinaturas **não** ganha quebra quando cabe, e os espaçadores somem ao final.
- Suíte atualizada para `v3.0.10`.

---

## [3.0.9] — 2026-08-20 — Assinatura da empresa cliente no PDF

### 🐛 Corrigido
- **A segunda assinatura não aparecia no PDF baixado**: a captura do html2canvas usa uma janela virtual de `680px`, que ativava o breakpoint responsivo de `900px` e empilhava os campos de assinatura. Dependendo da paginação, o campo da empresa cliente ficava fora da área exportada.
- O alvo de exportação agora mantém explicitamente as assinaturas da **Performance Ocupacional** e da **empresa cliente** em duas colunas, alinhadas lado a lado. A mesma garantia foi aplicada ao fallback de impressão.

### 🔄 Alterado
- Cache busting `?v=3.0.9` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.

### ✅ Testes
- Novo teste de regressão confirma que o layout de exportação preserva as duas colunas mesmo na largura A4 de `680px`.

---

## [3.0.8] — 2026-08-20 — Campos de assinatura (Performance Ocupacional e empresa cliente)

### ✨ Adicionado
- **Campos de assinatura na etapa Pagamento**: duas linhas no documento passam a ser configuráveis no formulário.
  - **Performance Ocupacional** — editável, pré-preenchido com `Performance Ocupacional`.
  - **Empresa cliente** — **preenchida automaticamente** com o nome da Empresa da etapa Cliente; pode ser ajustada se necessário.
- No preview/PDF, cada bloco ganha o rótulo **Assinatura**, a linha para rubrica e o nome correspondente abaixo.

### 🔄 Alterado
- Rascunho v3 passa a persistir `sigPerformance`, `sigClient` e o flag de edição manual da empresa cliente.
- Cache busting `?v=3.0.8` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.

### ✅ Testes
- Suíte atualizada para `v3.0.8`. Novos casos: campos no formulário, preenchimento automático da empresa cliente, nomes no bloco de assinatura do documento.

---

## [3.0.7] — 2026-08-20 — Rodapé paginado e quebra inteligente das assinaturas

### ✨ Adicionado
- **Rodapé “Página X de Y” em todas as páginas do PDF**, junto com a identificação `Proposta Nº … • Grupo Performance Ocupacional`. O carimbo é feito com o jsPDF **entre a paginação e o salvamento** (`toPdf()` → `get('pdf')` → `save()`), único momento em que o total real de páginas é conhecido; fica dentro da margem de 15 mm e não sobrepõe o conteúdo capturado.
- **Metadados do arquivo PDF** (`título`, `assunto`, `autor`, `criador`, `palavras-chave`) — o documento passa a se identificar corretamente no leitor de PDF e em buscas do cliente.

### 🔄 Alterado
- **Quebra antes das assinaturas agora é condicional**: até a 3.0.6 o bloco era *sempre* empurrado para uma página nova (`page-break-before: always` + `before: ['.doc-signatures']`), o que fazia propostas curtas terminarem com uma **folha quase vazia**. Agora `needsPageBreakBeforeSignatures()` mede o bloco com o layout de exportação já aplicado (680 px) e só força a quebra quando ele **não cabe** no espaço restante da página (altura útil ≈ 1008 px + 24 px de folga). A proteção contra corte no meio continua garantida pelo `page-break-inside: avoid`.
- Mesma correção no **fallback de impressão nativa** (`@media print`): `break-inside: avoid` no lugar do `page-break-before: always`.
- **PDF comprimido** (`jsPDF.compress: true`): arquivos menores para envio por e-mail/WhatsApp, sem perda visível.
- A margem do html2pdf passou a usar a constante `PDF_MARGIN_MM`, compartilhada com o cálculo da largura útil e do rodapé (fim do número mágico duplicado).
- Cache busting `?v=3.0.7` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.

### 🐛 Corrigido
- **`.gitignore` inutilizável**: o arquivo continha literalmente o texto `(empty)`. Agora ignora `node_modules/`, artefatos de editor/SO, logs e PDFs gerados em teste.

### ✅ Testes
- Suíte ampliada: rodapé paginado (numeração em todas as páginas, ordem `toPdf → carimbo → save`, tolerância a jsPDF sem `setProperties`), quebra condicional (cabe → sem quebra; não cabe → quebra; bloco maior que a página → sem quebra) e compressão do jsPDF.
- O worker falso dos testes de integração ganhou `toPdf()`/`get('pdf')`, validando o carimbo no fluxo real em DOM.

---

## [3.0.6] — 2026-08-20 — Documento centralizado na folha A4

### 🔄 Alterado
- **Margens do PDF aumentadas e equilibradas**: de 8 mm para **15 mm** em cada lado da folha A4. O documento agora fica visualmente centralizado/enquadrado na página, com margens laterais iguais e mais respiro.
- **Largura útil A4 recalculada**: de 733 px para **680 px** (210 mm − 2 × 15 mm @96 dpi), aplicada ao `html2canvas` (`width`/`windowWidth`) e ao CSS de exportação.
- Cache busting `?v=3.0.6` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.

### ✅ Testes
- Suíte atualizada: largura útil A4 = 680 px e margem = 15 mm (unitários e integração).

---

## [3.0.5] — 2026-08-20 — Proporção A4 corrigida (conteúdo em largura total)

### 🐛 Corrigido
- **Proporção A4**: o PDF saía com o conteúdo **espremido na metade esquerda da página** (o documento não ocupava a largura do A4). Causa: o html2pdf monta um overlay fixo e **centraliza o container na viewport real do navegador**; como a captura usa `windowWidth: 733` (largura útil A4), tudo que passasse da coluna 733 era **cortado do canvas**. Correção: um estilo injetado durante a exportação fixa o container do html2pdf em `left: 0`, alinhando o clone à janela de captura — o documento agora ocupa os ~194 mm úteis do A4.
- **Buracos gigantes entre seções**: o `page-break-inside: avoid` em `.doc-items`/`.pd-table tr` fazia o plugin de quebra de página do html2pdf inserir divs de padding de centenas de pixels (e HTML inválido dentro do `<tbody>`), deixando páginas quase vazias. A tabela de itens agora quebra naturalmente entre páginas; blocos críticos (cabeçalho, totais, faturamento, aceite e assinaturas) continuam protegidos contra corte.

### 🔄 Alterado
- Cache busting `?v=3.0.5` em `src/css/style.css` e `src/js/script.js`; rodapé com a nova versão.
- O estilo de correção do layout é removido ao final da exportação (sucesso ou erro), sem efeitos colaterais no preview.

### ✅ Testes
- Suíte existente atualizada para `v3.0.5` (cache busting e rodapé).

---

## [3.0.4] — 2026-08-20 — PDF em branco definitivamente corrigido

### 🐛 Corrigido
- **PDF em branco**: a exportação agora **captura diretamente o preview visível** (`#proposalDoc`). O `html2canvas` mede o elemento com `getBoundingClientRect()` e reaplica essas coordenadas no clone interno — com o documento fora da viewport, o desenho caía fora da área do canvas e o arquivo saía em branco.
- **Sandbox fora da viewport removido**: `#pdf-export-sandbox` / `#pdf-export-wrap` (e o `left: -10000px`) deixaram de existir no CSS e no JS. Durante a captura o documento permanece na tela, apenas com a largura de exportação aplicada.
- **Validação do canvas antes do download**: `assertCanvasHasContent()` inspeciona o canvas gerado (dimensões e amostragem de pixels em grade) e **aborta a exportação** se ele estiver vazio ou totalmente uniforme, em vez de baixar um PDF em branco.

### 🔄 Alterado
- **Largura útil A4 de 733px** (210 mm ≈ 794 px menos 8 mm de margem por lado) aplicada ao `html2canvas` (`width`/`windowWidth`) e ao CSS de exportação, substituindo os antigos 1200 px de `windowWidth` e 794 px de largura. Evita reescala do canvas e corte da lateral direita.
- **Cache busting `?v=3.0.4`** em `src/css/style.css` e `src/js/script.js`, garantindo que navegadores com a versão anterior em cache recebam a correção.
- O preview `sticky` passa a `static` durante a exportação e o scroll do usuário é restaurado ao final.

### ✅ Testes
- Nova suíte `tests/pdf-export.test.mjs` (`node tests/pdf-export.test.mjs`): cobre captura do preview visível, ausência de sandbox offscreen, validação do canvas (inclusive o caso do canvas totalmente branco) e o cache busting.

---

## [3.0.3] — 2026-08-20 — Correção da exportação PDF

### 🐛 Corrigido
- **PDF em branco**: o elemento enviado ao `html2pdf` não herda mais o posicionamento `left: -10000px`. Apenas um sandbox externo fica fora da tela; a cópia capturada permanece na origem do canvas.
- Removido o modo global `avoid-all` da paginação, que podia inserir páginas vazias; os blocos importantes continuam protegidos individualmente contra quebra.
- A exportação agora aguarda todas as imagens do documento, incluindo a marca corporativa, antes da captura.
- Observações marcadas como internas não são mais incluídas acidentalmente no documento.
- O prazo de faturamento não repete mais a palavra “dias” quando ela já foi digitada.

### 🛡️ Melhorado
- Mensagem explícita quando a biblioteca `html2pdf` não está disponível.
- Limpeza garantida do sandbox de exportação após sucesso ou falha na geração.

---

## [3.0.2] — 2026-08-19 — Logo do cliente maior e assinaturas tradicionais

### 🔄 Alterado
- **Logo do cliente** no documento: de 64 px (máx. 180 px) para **192 px de altura**, com **máximo de 540 px** (3× o tamanho anterior), no preview A4 e no PDF. Com logo anexada, o bloco da empresa ocupa a largura total para a marca não ficar espremida.
- **Assinaturas** no final: linhas largas no estilo tradicional de contrato, com espaço para rubrica a caneta. Abaixo das linhas: **Performance Ocupacional** e o **nome da empresa cliente** preenchido no formulário.

---

## [3.0.1] — 2026-08-19 — Logo e assinaturas

### ✨ Adicionado
- **Bloco de assinaturas** no modelo final (preview e PDF), com duas colunas:
  - **Responsável pela Proposta** — `Grupo Performance Ocupacional` + responsável e telefone do formulário.
  - **Cliente** — nome da empresa + texto **Assinatura e carimbo** (espaço para rubrica física).

### 🔄 Alterado
- **Logo do cliente** no documento: de 28×28 px para **64 px de altura**, com **máximo de 180 px** (largura/altura), visível no preview A4 e no PDF gerado pelo html2pdf.

---

## [3.0.0] — 2026-08-19 — Corporativa

### 🎯 Objetivo
Transformar o gerador em produto **corporativo governado**: preview só no final e exportação confiável em PDF.

### ✨ Adicionado
- **Preview controlado**: painel oculto com estado vazio corporativo; liberação apenas em **Revisar (4/4) → Carregar & Preview** (topbar e CTA do card). Flag `previewUnlocked`, validação de obrigatórios e de itens antes de liberar.
- **Download PDF corporativo**: integração **html2pdf.js 0.10.1** (html2canvas + jsPDF), A4 com margens 8 mm, `scale:2`, nome `Proposta-{Cliente}-{PROP-YYYY-MMDD-###}.pdf`. Sem `window.print` e sem `reload`.
- **Número de documento**: `PROP-YYYY-MMDD-###` no header, statusbar e nome do arquivo; renovado após cada download.
- **Barra de status corporativa**: navy, dot verde, validade e nº do documento.
- **Progresso do wizard**: barra 25/50/75/100%.
- **Resumo de Revisão**: grid com Empresa/Responsável/Contrato/Total antes do preview.
- **Validação de logo**: MIME (PNG/JPG/WebP) e limite 2 MB com feedback de nome/tamanho.
- **Contador de observações** e hints corporativos.
- **Manifest 3.0**: `theme_color #0f2a44`, `name` corporativo.

### 🔄 Alterado
- **Topbar**: `Visualizar` + `Imprimir` removidos → **`Carregar & Preview` (primary)** + **`Baixar PDF` (accent, desabilitado até preview)** + `Salvar`/`Limpar` ghost.
- **Paleta**: de azul claro/verde genérico para **navy corporativo** (`#0f2a44`, `#e9eef6`, `#0e7a5a`), cards mais sóbrios e sombras suaves.
- **Layout**: grid `1fr 560px` com preview sticky; em mobile o preview desce e faz scroll suave ao liberar.
- **LocalStorage**: nova chave `performance_proposal_draft_v3` com `meta {version:'3.0', docNumber, savedAt}`; leitura com fallback para `v1`.
- **CSS**: `--card-radius 16px`, toolbar do preview com selo “A4 • Corporativo”, empty-state com checklist.
- **JS**: `buildPreview()` puro, `revealPreview()` governado, `updateTotals()` reativo, `validateRequired()` central.

### 🗑️ Removido
- Botão `Visualizar` isolado e função `window.print` com `innerHTML` + `reload` (causava perda de dados).

### 🐛 Corrigido
- Perda de estado ao imprimir; PDFs em branco por preview incompleto; logo externo do Drive.
- Wizard sem progresso visível e sem bloqueio de exportação parcial.

### 🔒 Segurança
- Sanitização `escapeHtml` mantida; validação de upload impede arquivos maliciosos grandes.

---

## [2.1.0] - 2025-08-18

### ✨ Adicionado
- Wizard 4 etapas, preview em tempo real, salvamento localStorage, validação de obrigatórios/e-mail/telefone, formatação CNPJ/CPF, upload de logo, cálculos automáticos, notificações, layout de impressão, responsivo.

### 🎨 Melhorado
- Interface com gradientes e animações.

### 🐛 Corrigido
- Navegação do wizard e arredondamentos de totais.

---

## [2.0.0] - 2025-XX-XX
- Primeira versão do Gerador de Propostas — estrutura base HTML/CSS/JS.

---

## Tipos de Mudanças
- **Adicionado** (`Added`) · **Alterado** (`Changed`) · **Descontinuado** (`Deprecated`) · **Removido** (`Removed`) · **Corrigido** (`Fixed`) · **Segurança** (`Security`)

*Veja também `README.md` e `GUIA_USO.md` v3.0.*
