# 🤝 Guia de Contribuição

Obrigado por seu interesse em contribuir com o **Gerador de Proposta Comercial**! Este documento fornece diretrizes para ajudar você a contribuir de forma eficaz.

---

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Fluxo de Trabalho Git](#fluxo-de-trabalho-git)
4. [Padrões de Código](#padrões-de-código)
5. [Commits](#commits)
6. [Pull Requests](#pull-requests)
7. [Reportando Bugs](#reportando-bugs)
8. [Sugerindo Melhorias](#sugerindo-melhorias)

---

## 🧭 Código de Conduta

Este projeto e todos os contribuidores são regidos pelo nosso Código de Conduta. Ao participar, você concorda em cumprir estes termos. Em resumo:

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Demonstre empatia para com outros membros

---

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **Reportar bugs**
2. **Sugerir novas funcionalidades**
3. **Corrigir bugs**
4. **Implementar novas features**
5. **Melhorar documentação**
6. **Traduções**
7. **Revisão de código**

### Primeiros Passos

1. **Fork** o repositório
2. **Clone** seu fork localmente
   ```bash
   git clone https://github.com/SEU-USUARIO/gerador-proposta-performance.git
   cd gerador-proposta-performance
   ```
3. Crie uma **branch** para sua contribuição
   ```bash
   git checkout -b tipo/descricao-curta
   ```
4. Faça suas mudanças e **commit**
5. **Push** para seu fork
6. Abra um **Pull Request**

---

## 🔀 Fluxo de Trabalho Git

### Branch Naming Convention

Use prefixos para indicar o tipo de mudança:

```
feature/nova-funcionalidade
fix/correcao-bug
docs/atualizacao-documentacao
style/melhoria-estilo
refactor/refatoracao-codigo
test/adicao-testes
chore/atualizacao-configuracoes
```

**Exemplos:**
```bash
git checkout -b feature/exportacao-pdf
git checkout -b fix/validacao-email
git checkout -b docs/atualiza-readme
```

---

## 📝 Padrões de Código

### HTML

- Use tags semânticas (`<header>`, `<main>`, `<section>`, etc.)
- Mantenha a indentação consistente (2 espaços)
- Use atributos `alt` em imagens
- Adicione comentários para seções complexas

```html
<!-- Bom -->
<section class="client-info">
  <h2>Informações do Cliente</h2>
  <!-- conteúdo -->
</section>

<!-- Ruim -->
<div class="box">
  <div>Título</div>
  <!-- conteúdo -->
</div>
```

### CSS

- Use variáveis CSS para cores e valores repetidos
- Siga a ordem: Layout → Typography → Visual
- Use classes descritivas (evite IDs para estilização)
- Mantenha o CSS específico o necessário

```css
/* Bom */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 12px 20px;
}

/* Ruim */
.button {
  background: #3b82f6;
  color: #fff;
  padding: 12px 20px;
}
```

### JavaScript

- Use `const` e `let`, evite `var`
- Nomeie funções e variáveis de forma descritiva
- Comente lógica complexa
- Trate erros adequadamente
- Evite globals desnecessários

```javascript
// Bom
const calculateTotal = (items, discount) => {
  try {
    const subtotal = items.reduce((sum, item) => sum + item.value, 0);
    return subtotal - (subtotal * discount / 100);
  } catch (error) {
    console.error('Erro ao calcular total:', error);
    return 0;
  }
};

// Ruim
function calc(i, d) {
  return i - (i * d / 100);
}
```

---

## 💬 Commits

### Formato do Commit

Siga o padrão **Conventional Commits**:

```
tipo(escopo): descrição curta e clara

Descrição opcional mais detalhada.
- Inclua contexto quando necessário
- Liste mudanças importantes
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto-e-vírgula faltante, etc.
- `refactor`: Refatoração de código
- `test`: Adição ou atualização de testes
- `chore`: Atualização de configs, build, etc.

**Exemplos:**
```bash
git commit -m "feat(wizard): adiciona validação na etapa de cliente"
git commit -m "fix(calculos): corrige arredondamento de descontos"
git commit -m "docs(readme): atualiza instruções de instalação"
```

### Dicas de Commit

- Faça commits atômicos (uma mudança por commit)
- Escreva mensagens claras e no presente
- Limite a primeira linha a 50 caracteres
- Use o corpo para explicar o "porquê", não o "como"

---

## 🔄 Pull Requests

### Antes de Enviar

- [ ] Teste suas mudanças localmente
- [ ] Verifique se não há conflitos com a branch principal
- [ ] Execute testes (se aplicável)
- [ ] Revise seu próprio código
- [ ] Atualize a documentação se necessário

### Template de PR

```markdown
## Descrição
Descreva suas mudanças e o propósito deste PR.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Melhoria
- [ ] Documentação
- [ ] Refatoração

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Testei minhas mudanças localmente
- [ ] Atualizei a documentação (se necessário)
- [ ] Meus commits seguem o padrão Conventional Commits

## Screenshots (se aplicável)
Adicione screenshots para mostrar mudanças visuais.

## Issue relacionada
Fixes #123 (se aplicável)
```

---

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição**
Uma descrição clara do bug.

**Para Reproduzir**
Passos para reproduzir:
1. Ir para '...'
2. Clicar em '....'
3. Ver erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [Windows, macOS, Linux]
- Navegador: [Chrome 96, Firefox 95, etc.]
- Versão: [v2.1.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 💡 Sugerindo Melhorias

### Template de Feature Request

```markdown
**Funcionalidade**
Descreva a funcionalidade desejada.

**Problema Relacionado**
Isso resolve algum problema? Qual?

**Solução Proposta**
Como você imagina que isso funcione?

**Alternativas Consideradas**
Outras soluções que você pensou.

**Contexto Adicional**
Mais informações, mockups, etc.
```

---

## 🔍 Processo de Revisão

1. Um mantenedor revisará seu PR
2. Feedback será fornecido (se necessário)
3. Após aprovação, seu PR será merged
4. Você será creditado nas notas de versão!

---

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra uma **Issue** para discussão
- Entre em contato com os mantenedores
- Participe das discussões existentes

---

## 🙏 Agradecimentos

Toda contribuição é valiosa, não importa quão pequena. Obrigado por fazer parte deste projeto!

---

*Baseado em templates de contribuição open-source*  
*Última atualização: Agosto 2025*
