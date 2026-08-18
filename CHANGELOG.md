# 📝 CHANGELOG - Histórico de Versões

Todas as mudanças importantes neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.1.0] - 2025-08-18

### ✨ Adicionado
- Sistema de wizard com 4 etapas (Cliente, Itens, Pagamento, Revisão)
- Preview em tempo real da proposta
- Salvamento de rascunhos no localStorage
- Validação de campos obrigatórios
- Validação de email e telefone
- Formatação automática de CNPJ/CPF
- Upload de logo do cliente
- Cálculo automático de subtotais e descontos
- Sistema de notificações visuais
- Layout otimizado para impressão
- Design responsivo para dispositivos móveis

### 🎨 Melhorado
- Interface moderna com gradientes e sombras
- Animações suaves nas transições
- Feedback visual nos botões e inputs
- Organização visual das informações de faturamento

### 🐛 Corrigido
- Problemas de navegação entre etapas do wizard
- Cálculos de totais com casas decimais

---

## [2.0.0] - 2025-XX-XX

### ✨ Adicionado
- Primeira versão do Gerador de Propostas
- Estrutura base HTML/CSS/JS

---

## Tipos de Mudanças

- **Adicionado** (`Added`): Novas funcionalidades
- **Alterado** (`Changed`): Mudanças em funcionalidades existentes
- **Descontinuado** (`Deprecated`): Funcionalidades que serão removidas em breve
- **Removido** (`Removed`): Funcionalidades removidas nesta versão
- **Corrigido** (`Fixed`): Correção de bugs
- **Segurança** (`Security`): Melhorias de segurança

---

## Notas da Versão 2.1.0

### Funcionalidades Principais

1. **Wizard de 4 Etapas**
   - Navegação intuitiva passo-a-passo
   - Indicadores visuais de progresso
   - Validação por etapa

2. **Preview em Tempo Real**
   - Atualização instantânea dos dados
   - Layout idêntico ao da impressão
   - Visualização profissional

3. **Salvamento Local**
   - Dados persistem no navegador
   - Carregamento rápido de rascunhos
   - Sem necessidade de servidor

4. **Impressão Profissional**
   - Layout dedicado para impressão
   - Ocultação de elementos da UI
   - Pronto para PDF ou papel

### Tecnologias
- HTML5 semântico
- CSS3 com variáveis
- JavaScript ES6+
- Font Awesome 6 (CDN)
- Google Fonts - Inter (CDN)

### Conhecidas Limitações
- Requer conexão internet para CDN (fontes e ícones)
- Limite de ~5MB do localStorage
- Dados salvos apenas no dispositivo local

---

*Para mais informações, consulte o [README.md](README.md) e [PLANO_MELHORIAS.md](PLANO_MELHORIAS.md)*
