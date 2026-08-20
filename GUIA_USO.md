# 📘 Guia de Uso — Gerador 3.0 Corporativo

## Grupo Performance Ocupacional

---

## ⚡ Início Rápido

**Abrir:** `index.html` direto ou `python -m http.server 8000` → http://localhost:8000

> Requer internet para CDN (Inter, Font Awesome, html2pdf). Sem internet o app abre, mas PDF e ícones falham.

---

## 🧭 Fluxo Corporativo (preview só no final)

O 3.0 bloqueia o preview até a última etapa para garantir proposta completa.

### Etapa 1 — Cliente (1/4)
| Campo | Obrig. | Exemplo |
|-------|--------|---------|
| Empresa | ✅ | ABC Indústria Ltda |
| Unidade / Contrato | ✅ | Matriz / Contrato 001 |
| Responsável | ✅ | João Silva |
| Telefone | ✅ | (31) 99999-9999 |
| E-mail | ❌ | contato@abc.com.br |
| CNPJ/CPF | ❌ | auto-formata |
| Endereço / Cidade / UF | ❌ | Rua X, 123 / BH / MG |
| Observações | ❌ | até 500c (contador) |
| Logo | ❌ | PNG/JPG/WebP até 2 MB |

### Etapa 2 — Itens (2/4)
- **Adicionar item** → Descrição, Qtd, Valor unit. → subtotal auto.
- Desconto % no rodapé; total recalculado em centavos.
- Lixeira remove linha.

### Etapa 3 — Pagamento (3/4)
- Forma: À vista / Cartão / PIX / **Faturamento** (revela “Dias combinados”).
- Estimativa de entrega (ex.: 15 dias úteis). Validade fixa 30 dias aparece no PDF.

### Etapa 4 — Revisar (4/4) — ÚNICA COM PREVIEW
- Grid de resumo: Empresa, Responsável, Contrato, Total.
- Callout escuro explica o bloqueio corporativo.
- Clique em **`Carregar & Preview`** — tanto no topo quanto no botão grande do card.
  - Valida obrigatórios + ao menos 1 item; se ok, renderiza o documento A4 no painel ao lado (desktop) ou abaixo (mobile).
  - Se houver rascunho v3 (ou v1 legado), ele é carregado antes de renderizar.
- Após o preview, o botão **`Baixar PDF`** (verde, topo) é habilitado.

---

## 💾 Salvar / Carregar / Limpar

- **Salvar**: valida obrigatórios e grava em `localStorage` chave `performance_proposal_draft_v3` (`{meta:{version:'3.0', docNumber, savedAt}, ...}`). Fallback de leitura para `v1`.
- **Carregar & Preview**: carrega (se existir) **e** revela o preview; sem rascunho, apenas revela com dados atuais.
- **Limpar**: confirma e remove v3 e v1; recolhe o preview e desabilita Baixar PDF.

> Dados são locais por navegador/dispositivo (~5 MB). Limpar cache apaga.

---

## 📥 Baixar PDF (substitui Imprimir)

1. Chegue em **Revisar → Carregar & Preview** (validação passa, preview visível).
2. Clique em **`Baixar PDF`** no topo.
3. O arquivo `Proposta-{Cliente}-{PROP-YYYY-MMDD-###}.pdf` baixa automaticamente (A4, 8 mm margem, alta resolução `scale:2`).
4. Após baixar, um novo `PROP-...` é gerado para a próxima proposta.
5. Falha no html2pdf → fallback para `window.print()`.

**Dicas PDF:**
- Papel A4, retrato, margens padrão.
- Cores e logos preservados; tabelas com quebra automática.
- Nome do arquivo usa Empresa (sanitizada) + nº do documento da barra de status.
- **Logo do cliente** aparece ao lado do nome da empresa (192 px de altura, até 540 px).
- **Assinaturas** no final do documento, no formato tradicional: linha larga com espaço para rubrica a caneta e, abaixo, **Performance Ocupacional** e o **nome da empresa** preenchido na etapa Cliente.

---

## 🎨 Personalização

- **Cores**: `src/css/style.css` → `:root { --primary:#0f2a44; --accent:#0e7a5a; }`
- **Logo**: `index.html` → `#brandLogo` e `#docLogo` → `src/assets/Logotipo.png`
- **Faturamento**: `index.html` → `.billing-info` (dois blocos CNPJ)
- **Validade**: `30 dias` está no HTML do doc e na statusbar; troque em ambos se mudar política.

---

## ❓ Problemas Comuns (3.0)

| Mensagem | Causa | Solução |
|----------|-------|---------|
| “Preencha campos obrigatórios” | Falta Empresa/Unidade/Responsável/Telefone ou nenhum item | Complete passos 1–2 |
| Baixar PDF desabilitado | Preview ainda bloqueado | Revisar → Carregar & Preview |
| Gerador de PDF indisponível / sem logo | Ad-block ou offline, ou logo >2 MB | Desative ad-block, verifique a conexão e use PNG ≤2 MB |
| Rascunho não carrega | LocalStorage desabilitado / privado | Habilite cookies/localStorage, tente outro navegador |
| Total não fecha | Casas decimais | Corrigido com cálculo em centavos (v3) |

---

## 📊 Diagrama de Fluxo

```
[1 Cliente] → [2 Itens] → [3 Pagamento] → [4 Revisar]
                                         ├─▶ Carregar & Preview (valida → renderiza A4)
                                         └─▶ Baixar PDF (html2pdf → arquivo nomeado)
[Salvar] ── localStorage v3 ──▶ [Carregar & Preview recupera]
```

---

*Versão: 3.0.0 Corporativa | 19/08/2026*
