# 🚀 Gerador de Proposta Comercial — Grupo Performance Ocupacional

## Versão 3.0 Corporativa

[![Version](https://img.shields.io/badge/version-3.0.9-0f2a44.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PDF](https://img.shields.io/badge/PDF-html2pdf-0e7a5a.svg)](#-download-em-pdf-corporativo)
[![Status](https://img.shields.io/badge/status-corporativo-0f2a44.svg)](#)

> Sistema web corporativo para geração de propostas comerciais. Fluxo controlado em 4 etapas, **preview liberado apenas ao final** via botão **Carregar & Preview** e **download direto em PDF** (sem impressão do navegador).

---

## 📖 Sobre

O Gerador 3.0 Corporativo substitui o fluxo livre da v2.1 por um **fluxo governado**:

- **Preview bloqueado até a Revisão**: evita impressão de rascunhos incompletos e garante consistência visual.
- **Baixar PDF** no lugar de **Imprimir**: arquivo nomeado `Proposta-{Cliente}-{Nº}.pdf`, formato A4 (margens de 15 mm), **rodapé “Página X de Y”** em todas as folhas, metadados preenchidos e compressão ativa — pronto para envio ao cliente.
- **Identidade corporativa**: paleta navy `#0f2a44`, tipografia Inter, barra de status, número de documento e selo “CORPORATIVO”.

Empresa: **Grupo Performance Ocupacional** — Saúde e Segurança Ocupacional.

| Unidade | Foco | CNPJ |
|---------|------|------|
| Filial Itaguara/MG | Documentação e Treinamentos | 27.708.974/0001-80 |
| Matriz Itatiaiuçu/MG | Exames Médicos Ocupacionais | 13.583.116/0001-42 |

---

## ✨ O que mudou da v2.1 → v3.0

| Antes (2.1) | Agora (3.0 Corporativo) |
|-------------|-------------------------|
| Preview visível o tempo todo, atualizado por “Visualizar” | Preview **oculto** com estado vazio corporativo; só aparece em **Etapa 4 → Carregar & Preview** (topo ou card de Revisão) |
| Botões `Visualizar` + `Imprimir` (window.print + reload) | Botão único **`Carregar & Preview`** (valida + renderiza) e **`Baixar PDF`** (html2pdf.js, sem reload, sem perda de dados) |
| LocalStorage `performance_proposal_draft_v1` | `performance_proposal_draft_v3` com `meta.version=3.0` e `docNumber` (`PROP-YYYY-MMDD-###`) |
| Paleta clara azul/verde genérica | Paleta corporativa navy + off-white + verde corporativo, barra de status, selos e divisores profissionais |
| Sem número de proposta | Número automático no header, na barra de status e no nome do PDF |
| Upload de logo sem validação | Validação MIME + limite 2 MB + feedback de nome/tamanho |

### Análise de melhorias (resumo técnico)

**Problemas da v2.1 corrigidos:**
- `window.print()` com `innerHTML` + `reload` perdia estado não salvo → trocado por `html2pdf` com canvasA4, sem reload.
- Preview “vivo” gerava PDFs incompletos → fluxo controlado com `previewUnlocked` flag e validação de obrigatórios + itens.
- Sem paginação A4 confiável → `html2pdf` com `margin 15mm`, `scale:2`, `pagebreak: css/legacy`, quebra antes das assinaturas **medida sob demanda** (só quando o bloco não cabe na folha) e rodapé paginado carimbado via jsPDF.
- Logo do Drive + CDN sem fallback → logo local `src/assets/Logotipo.png` + validação de upload.
- JS monolítico sem estados → separação lógica: `buildPreview()` puro, `revealPreview()` governado, `updateTotals()` reativo.

**Ganhos corporativos:**
- Consistência: o comercial só consegue exportar após preencher Cliente/Itens/Pagamento.
- Rastreabilidade: `docNumber` por proposta, exibido no PDF e no nome do arquivo.
- UX: progresso 25%/50%/75%/100%, notificações toast, contador de observações, validação inline.

---

## 🧭 Fluxo de uso (3.0)

1. **Cliente (1/4)** — preencha Empresa, Unidade, Responsável, Telefone (*). CNPJ, endereço, logo (opcional, 2 MB).
2. **Itens (2/4)** — adicione linhas, qtd e valor unit.; desconto % aplicado ao final.
3. **Pagamento (3/4)** — forma (À vista, Cartão, PIX, Faturamento + dias), prazo de entrega e **assinaturas** (Performance Ocupacional + empresa cliente, esta última preenchida automaticamente).
4. **Revisar (4/4)** — resumo de 4 campos + callout de segurança. Clique em **`Carregar & Preview`** (topo ou no card). O painel à direita (desktop) ou abaixo (mobile) revela o documento A4.
5. **`Baixar PDF`** — botão esverdeado habilitado após o preview. Gera e baixa o PDF nomeado. O documento inclui a **logo do cliente** (96 px, máx. 270 px) e **duas linhas de assinatura** (Performance Ocupacional / empresa cliente preenchida no formulário).

> **Atalhos:** `Salvar` persiste em localStorage. `Carregar & Preview` tenta carregar o rascunho v3 (fallback v1) **e** revela o preview. `Limpar` remove o rascunho (confirmação).

---

## 🛠️ Tecnologias

- HTML5 semântico, CSS3 (variáveis corporativas), JavaScript ES6+ vanilla
- **html2pdf.js 0.10.1** (html2canvas + jsPDF) via CDN para exportação PDF
- Font Awesome 6.5, Google Fonts Inter
- LocalStorage (sem backend), PWA manifest

---

## 📁 Estrutura

```
gerador-proposta/
├── index.html              # v3.0 corporativo (preview controlado + Baixar PDF)
├── push.sh                 # script para publicar a branch ativa no GitHub
├── src/
│   ├── css/style.css       # tema navy corporativo
│   ├── js/script.js        # lógica 3.0 (previewUnlocked, html2pdf, validação)
│   ├── assets/             # logos e favicons
│   └── manifest.json       # PWA 3.0
├── tests/                  # suíte de testes (Node, sem build)
│   ├── pdf-export.test.mjs             # correção do PDF em branco
│   ├── pdf-export.integration.test.mjs # fluxo de exportação em DOM real
│   └── run.sh
├── README.md               # este arquivo
├── CHANGELOG.md
├── GUIA_USO.md             # guia 3.0
├── PRIVACIDADE_SEGURANCA.md
└── LICENSE
```

---

## 🚀 Instalação

```bash
git clone <repo>
cd gerador_propostas
python -m http.server 8000
# http://localhost:8000
```

Sem build. Abra `index.html` direto se preferir (CDNs requerem internet).

---

## 📤 Publicação no GitHub

Para publicar as alterações da branch atual no repositório remoto:

```bash
./push.sh
```

O comando identifica a branch de trabalho atual e executa o envio (`git push -u origin <branch>`) com validação de estado.

---

## 🧪 Testes

```bash
./tests/run.sh
```

Os testes unitários rodam só com Node, sem dependências. Os testes de integração
carregam o `index.html` e o `script.js` reais em um DOM e executam a exportação
de ponta a ponta com um `html2pdf` instrumentado — inclusive o caso do canvas em
branco, que deve **abortar** o download. Eles usam `jsdom`; sem ele instalado
(`npm i -D jsdom`) são ignorados sem falhar a suíte.

---

## 🎨 Personalização

**Cores** em `src/css/style.css` (`:root`):
```css
--primary: #0f2a44; --accent: #0e7a5a; --primary-light: #e9eef6;
```

**Faturamento** em `index.html` → `.billing-info` (dois blocos CNPJ).

**Logo** → `src/assets/Logotipo.png` (docHeader e #brandLogo).

---

## 🔒 Privacidade

100% local: dados ficam em `localStorage` no navegador. Sem envio a servidores. Limite ~5 MB, apagado ao limpar cache. Logo é convertida em DataURL (não enviada). Veja `PRIVACIDADE_SEGURANCA.md`.

---

## 🐛 Solução de problemas

| Sintoma | Causa | Solução |
|---------|-------|---------|
| “Preencha campos obrigatórios” ao clicar Carregar | Faltam Empresa/Unidade/Responsável/Telefone ou nenhum item | Preencha passos 1–3 |
| Baixar PDF desabilitado | Preview ainda bloqueado | Vá em Revisar → Carregar & Preview |
| Gerador de PDF indisponível | CDN do html2pdf bloqueado por ad-block ou sem internet | Desative o bloqueador e verifique a conexão |
| Logo não aparece | Arquivo >2 MB ou formato inválido | Use PNG/JPG ≤2 MB |
| PDF sai em branco | Versão antiga em cache no navegador | Recarregue com Ctrl+Shift+R (os assets já usam `?v=3.0.9`) |
| “O PDF sairia em branco” | O preview não terminou de renderizar | Aguarde o preview carregar e tente novamente |

---

## 📄 Licença

MIT — veja `LICENSE`.

---

## 👨‍💻 Autor • Empresa

**Filipe Goulart** — Gerador de Propostas  
**Grupo Performance Ocupacional** — Itaguara/MG & Itatiaiuçu/MG

*Última atualização: 20/08/2026 — v3.0.9 Corporativa*
