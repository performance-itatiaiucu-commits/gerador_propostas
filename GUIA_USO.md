# 📘 Guia Rápido de Uso

## Gerador de Proposta Comercial - Grupo Performance Ocupacional

---

## ⚡ Início Rápido

### 1. Abrir o Sistema
- **Opção A**: Abra o arquivo `index.html` diretamente no navegador
- **Opção B**: Use um servidor local (recomendado)
  ```bash
  python -m http.server 8000
  # Acesse: http://localhost:8000
  ```

### 2. Criar Nova Proposta
Siga as 4 etapas do wizard:

#### 📋 Etapa 1 - Cliente
| Campo | Obrigatório | Exemplo |
|-------|-------------|---------|
| Empresa | ✅ | ABC Indústria Ltda |
| Unidade | ✅ | Matriz / Contrato 001 |
| Responsável | ✅ | João Silva |
| Telefone | ✅ | (31) 99999-9999 |
| Email | ❌ | contato@abc.com.br |
| CNPJ/CPF | ❌ | 00.000.000/0000-00 |
| Endereço | ❌ | Rua das Flores, 123 |
| Cidade/UF | ❌ | Belo Horizonte / MG |
| Observações | ❌ | Cliente preferencial |
| Logo | ❌ | Upload de imagem |

💡 **Dica**: A formatação do CNPJ/CPF é automática!

#### 📦 Etapa 2 - Itens
1. Clique em **"Adicionar item"**
2. Preencha:
   - **Descrição**: Nome do serviço/produto
   - **Qtd**: Quantidade
   - **Valor unit.**: Preço unitário
3. O **subtotal** é calculado automaticamente
4. Aplique **desconto** percentual se necessário
5. O **total geral** aparece no rodapé

💡 **Dica**: Você pode remover itens clicando no ícone de lixeira!

#### 💳 Etapa 3 - Pagamento
- **Forma de pagamento**: Selecione a opção
  - À vista
  - Cartão de Crédito
  - PIX
  - Faturamento (mostra campo para dias combinados)
- **Estimativa de entrega**: Ex.: "15 dias úteis"

💡 **Dica**: Para faturamento, especifique os dias combinados!

#### 👀 Etapa 4 - Revisar
- Revise todas as informações no preview à direita
- Volte às etapas anteriores se precisar corrigir
- Clique em **"Visualizar"** para atualizar
- Clique em **"Imprimir"** para gerar a proposta

---

## 💾 Salvando e Carregando

### Salvar Rascunho
1. Preencha pelo menos os campos obrigatórios
2. Clique em **"Salvar"** no topo
3. Confirmação aparecerá como notificação

### Carregar Rascunho
1. Clique em **"Carregar"** no topo
2. Dados serão preenchidos automaticamente
3. Preview será atualizado

### Limpar Rascunho
1. Clique em **"Limpar"** no topo
2. Confirme a ação
3. Rascunho será removido do navegador

⚠️ **Atenção**: Os dados são salvos apenas neste navegador/dispositivo!

---

## 🖨️ Imprimindo a Proposta

### Método 1: Botão Imprimir
1. Clique em **"Imprimir"** (botão verde no topo)
2. A janela de impressão do navegador abrirá
3. Selecione sua impressora ou "Salvar como PDF"

### Método 2: Print do Navegador
1. Clique em **"Visualizar"** primeiro
2. Use `Ctrl+P` (Windows) ou `Cmd+P` (Mac)
3. Ajuste configurações de impressão

### Configurações Recomendadas
- ✅ Papel: A4
- ✅ Margens: Padrão ou Mínimas
- ✅ Escala: 100%
- ✅ Plano de fundo: Marcado (para cores)

---

## 🎨 Personalização Rápida

### Mudar Cores
Edite `style.css`, linha ~1:
```css
:root {
  --primary: #3b82f6;    /* Azul principal */
  --accent: #10b981;     /* Verde destaque */
}
```

### Mudar Logo da Empresa
Edite `index.html`, linha ~26:
```html
<img id="brandLogo" src="SUA_URL_OU_ARQUIVO" alt="Performance" />
```

### Alterar Informações de Faturamento
Edite `index.html`, linhas ~280-296:
```html
<div class="billing-info">
  <!-- Edite CNPJ, Razão Social, etc. -->
</div>
```

---

## ❓ Problemas Comuns

### "O rascunho não salva"
✅ Verifique se o localStorage está habilitado  
✅ Limpe cache e cookies  
✅ Tente outro navegador  

### "A impressão sai em branco"
✅ Clique em "Visualizar" antes de imprimir  
✅ Verifique se há itens adicionados  
✅ Use "Salvar como PDF" para testar  

### "Os ícones não aparecem"
✅ Verifique conexão com internet (CDN)  
✅ Desative ad-blockers temporariamente  

### "O total não fecha centavos"
✅ Isso foi corrigido na v2.1.0  
✅ Atualize seu arquivo script.js  

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────┐
│  1. Abrir index.html no navegador       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  2. Preencher dados do cliente          │
│     - Campos obrigatórios marcados *    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  3. Adicionar itens da proposta         │
│     - Quantidades e valores             │
│     - Desconto opcional                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  4. Configurar pagamento e entrega      │
│     - Forma de pagamento                │
│     - Prazo de entrega                  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  5. Revisar no preview                  │
│     - Conferir todos os dados           │
│     - Corrigir se necessário            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  6. Salvar rascunho (opcional)          │
│     - Para continuar depois             │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  7. Imprimir ou exportar PDF            │
│     - Botão Imprimir                    │
│     - Ou Ctrl+P                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Boas Práticas

### ✅ Faça
- Preencha todos os campos obrigatórios
- Revise antes de imprimir
- Salve rascunhos importantes
- Use descrições claras nos itens
- Teste em diferentes navegadores

### ❌ Não Faça
- Não deixe o navegador aberto por dias (pode perder dados)
- Não confie apenas no localStorage para dados críticos
- Não imprima sem visualizar antes
- Não use caracteres especiais nos campos de texto

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Veja o [README.md](README.md)
3. Reporte issues no repositório

---

*Versão: 2.1.0 | Última atualização: Agosto 2025*
