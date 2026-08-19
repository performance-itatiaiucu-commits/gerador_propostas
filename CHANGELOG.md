# 📝 CHANGELOG — Histórico de Versões

Baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e [SemVer](https://semver.org/lang/pt-BR/).

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
