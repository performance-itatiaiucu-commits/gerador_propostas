# 📋 Checklist de Implantação e Verificação

## Gerador de Proposta Comercial — Grupo Performance Ocupacional

---

## ✅ Checklist Pré-Implantação

### 1. Configuração do Ambiente

- [ ] **Navegadores Testados**
  - [ ] Chrome (versão 80+)
  - [ ] Firefox (versão 75+)
  - [ ] Edge (versão 80+)
  - [ ] Safari (versão 13+)
  - [ ] Opera (versão 65+)

- [ ] **Dispositivos Testados**
  - [ ] Desktop (1920x1080)
  - [ ] Laptop (1366x768)
  - [ ] Tablet (768x1024)
  - [ ] Celular (375x667)

### 2. Funcionalidades Críticas

- [ ] **Wizard de 4 Etapas**
  - [ ] Navegação entre etapas funciona
  - [ ] Botões "Próximo" e "Anterior" respondem
  - [ ] Indicadores visuais de etapa ativa

- [ ] **Formulário de Cliente**
  - [ ] Campos obrigatórios validados
  - [ ] Validação de email funciona
  - [ ] Validação de telefone funciona
  - [ ] Formatação automática de CNPJ/CPF
  - [ ] Upload de logo do cliente

- [ ] **Itens da Proposta**
  - [ ] Adicionar item funciona
  - [ ] Remover item funciona
  - [ ] Cálculo de subtotal automático
  - [ ] Cálculo de desconto funciona
  - [ ] Total geral atualiza corretamente

- [ ] **Pagamento e Entrega**
  - [ ] Seleção de forma de pagamento
  - [ ] Campo "Dias combinados" aparece para Faturamento
  - [ ] Campo de estimativa de entrega

- [ ] **Preview em Tempo Real**
  - [ ] Dados do cliente aparecem corretamente
  - [ ] Itens listados no preview
  - [ ] Totais calculados corretamente
  - [ ] Logo do cliente exibida quando upload feito

- [ ] **Salvamento Local**
  - [ ] Salvar rascunho funciona
  - [ ] Carregar rascunho funciona
  - [ ] Limpar rascunho funciona
  - [ ] Notificações aparecem

- [ ] **Impressão**
  - [ ] Botão Imprimir abre diálogo de impressão
  - [ ] Layout de impressão está correto
  - [ ] Elementos da UI são ocultados
  - [ ] Exportação para PDF funciona

### 3. Validações e Segurança

- [ ] **Validação de Campos**
  - [ ] Empresa (obrigatório)
  - [ ] Unidade (obrigatório)
  - [ ] Responsável (obrigatório)
  - [ ] Telefone (obrigatório)
  - [ ] Email (formato válido)
  - [ ] Telefone (mínimo 10 dígitos)

- [ ] **Segurança**
  - [ ] Inputs sanitizados contra XSS
  - [ ] Validação de tipo de arquivo (logo)
  - [ ] Tamanho máximo de arquivo limitado
  - [ ] localStorage com tratamento de erro

### 4. Acessibilidade

- [ ] **Navegação por Teclado**
  - [ ] Tabulação entre campos funciona
  - [ ] Enter submete formulários
  - [ ] Escape cancela ações

- [ ] **Leitores de Tela**
  - [ ] Labels associados a inputs
  - [ ] Textos alternativos em imagens
  - [ ] Atributos ARIA presentes

- [ ] **Contraste e Cores**
  - [ ] Contraste de cores adequado
  - [ ] Informações não apenas por cor

### 5. Performance

- [ ] **Carregamento**
  - [ ] Página carrega em < 3 segundos
  - [ ] Fonts carregam corretamente
  - [ ] Ícones Font Awesome aparecem

- [ ] **Responsividade**
  - [ ] Layout se adapta a telas pequenas
  - [ ] Menu wizard responsivo
  - [ ] Preview ajustável

---

## 🚀 Processo de Implantação

### Opção 1: GitHub Pages (Recomendado)

```bash
# 1. Commit e push das mudanças
git add .
git commit -m "feat: versão pronta para produção v2.1.0"
git push origin main

# 2. No GitHub, ative GitHub Pages:
# Settings > Pages > Source: main branch / root
```

**URL Resultante:** `https://seu-usuario.github.io/gerador-proposta-performance/`

### Opção 2: Vercel

```bash
# 1. Instale Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod
```

**URL Resultante:** `https://gerador-proposta-performance.vercel.app/`

### Opção 3: Netlify

```bash
# 1. Arraste a pasta do projeto para Netlify Drop
# OU use CLI:
npm i -g netlify-cli
netlify deploy --prod
```

**URL Resultante:** `https://gerador-proposta-performance.netlify.app/`

### Opção 4: Servidor Próprio

```bash
# 1. Copie arquivos para servidor web
scp index.html style.css script.js manifest.json usuario@servidor:/var/www/html/propostas/

# 2. Configure HTTPS (obrigatório)
# Use Let's Encrypt:
sudo certbot --nginx -d seu-dominio.com
```

---

## 🔧 Pós-Implantação

### 1. Atualizar URLs e Links

Edite `index.html`:
- [ ] Substituir `https://seu-dominio.com/` pelas URLs reais
- [ ] Atualizar link da logo se necessário
- [ ] Configurar URL canônica

### 2. Configurar Domínio Personalizado (Opcional)

```bash
# No provedor de hospedagem:
# 1. Adicione domínio personalizado
# 2. Configure DNS:
#    A record: @ → IP do servidor
#    CNAME: www → seu-app.provedor.com
```

### 3. Habilitar HTTPS

- [ ] Certificado SSL instalado
- [ ] Redirect HTTP → HTTPS configurado
- [ ] HSTS headers configurados

### 4. Testar em Produção

- [ ] Abrir URL em navegador
- [ ] Testar todas as funcionalidades
- [ ] Verificar console sem erros
- [ ] Testar salvamento local
- [ ] Testar impressão
- [ ] Testar em dispositivo móvel

### 5. Monitoramento

- [ ] Google Analytics configurado (opcional)
- [ ] Google Search Console registrado
- [ ] Monitor de uptime configurado

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Tempo de Carregamento | < 3s | Lighthouse, PageSpeed Insights |
| Funcionalidade | 100% | Checklist acima |
| Compatibilidade | 95%+ browsers | Analytics |
| Satisfação do Usuário | 4.5+ estrelas | Feedback direto |

---

## 🐛 Plano de Contingência

### Se algo der errado:

1. **Site não carrega**
   - Verifique console do navegador
   - Teste em outro navegador
   - Reverta último deploy

2. **Funcionalidades não funcionam**
   - Limpe cache do navegador
   - Verifique versão dos arquivos
   - Restore de backup

3. **Dados perdidos**
   - Oriente usuário a usar "Carregar"
   - Verifique localStorage
   - Implemente backup automático

### Backup

```bash
# Criar backup antes de deploy
cp -r /workspace /backup/workspace-$(date +%Y%m%d)
```

---

## 📞 Suporte Pós-Lançamento

### Canais de Atendimento

- **Email**: [inserir]
- **Telefone**: [inserir]
- **Issue Tracker**: GitHub Issues

### SLA Sugerido

- Bugs críticos: 24 horas
- Bugs menores: 1 semana
- Melhorias: Próxima sprint

---

## 📝 Manutenção Contínua

### Tarefas Mensais

- [ ] Verificar logs de erro
- [ ] Atualizar dependências (CDN)
- [ ] Testar em novos navegadores
- [ ] Backup de feedback dos usuários

### Tarefas Trimestrais

- [ ] Revisar métricas de uso
- [ ] Planejar melhorias
- [ ] Atualizar documentação
- [ ] Testes de segurança

---

*Versão: 2.1.0 | Última atualização: Agosto 2025*
