# 🚀 Gerador de Proposta Comercial

## Grupo Performance Ocupacional — Versão 2.1

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](CHANGELOG.md)

---

## 📖 Sobre o Projeto

Sistema web para geração de propostas comerciais do **Grupo Performance Ocupacional**, especializado em saúde e segurança ocupacional. A aplicação permite criar, visualizar, salvar e imprimir propostas profissionais de forma rápida e eficiente.

### 🔗 Demo Online

[Acesse aqui](#) *(inserir link quando disponível)*

---

## ✨ Funcionalidades

- ✅ **Wizard Intuitivo**: Interface passo-a-passo em 4 etapas
  1. Informações do Cliente
  2. Itens da Proposta
  3. Pagamento & Entrega
  4. Revisão Final

- ✅ **Preview em Tempo Real**: Visualização instantânea da proposta
- ✅ **Salvamento Local**: Rascunhos salvos no navegador (localStorage)
- ✅ **Cálculos Automáticos**: Subtotais, descontos e totais calculados automaticamente
- ✅ **Upload de Logo**: Possibilidade de adicionar logo do cliente
- ✅ **Impressão Profissional**: Layout otimizado para impressão em PDF ou papel
- ✅ **Design Responsivo**: Funciona em desktops, tablets e celulares
- ✅ **Validação de Campos**: Campos obrigatórios e validação de email/telefone
- ✅ **Notificações**: Feedback visual para ações do usuário

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript (ES6+)** - Lógica e interatividade
- **Font Awesome 6** - Ícones
- **Google Fonts (Inter)** - Tipografia

---

## 📋 Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- JavaScript habilitado
- Conexão com internet (para carregar fontes e ícones via CDN)

---

## 🚀 Instalação e Uso

### Opção 1: Abrir Localmente

1. Clone ou baixe este repositório:
```bash
git clone https://github.com/seu-usuario/gerador-proposta-performance.git
cd gerador-proposta-performance
```

2. Abra o arquivo `index.html` diretamente no seu navegador:
```bash
# No Windows, basta dar dois cliques no arquivo
# Ou use um servidor local:
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Opção 2: Usar Servidor de Desenvolvimento

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (npx)
npx serve .

# Com PHP
php -S localhost:8000
```

---

## 📖 Como Usar

### Passo 1: Informações do Cliente
Preencha os dados da empresa cliente:
- Razão social / Nome fantasia
- Unidade/Contrato
- Responsável e telefone
- Email, CNPJ/CPF, endereço
- Observações (opcional)
- Logo do cliente (opcional)

### Passo 2: Itens da Proposta
Adicione os serviços/produtos:
- Clique em "Adicionar item"
- Preencha descrição, quantidade e valor unitário
- O subtotal é calculado automaticamente
- Aplique desconto percentual se necessário

### Passo 3: Pagamento & Entrega
Configure as condições:
- Forma de pagamento (À vista, Cartão, PIX, Faturamento)
- Dias combinados (para faturamento)
- Estimativa de entrega

### Passo 4: Revisar & Gerar
- Revise todas as informações no preview à direita
- Use os botões de navegação para corrigir se necessário
- Clique em **"Visualizar"** para atualizar o preview
- Clique em **"Imprimir"** para gerar a proposta final

### Salvando Rascunhos
- **Salvar**: Guarda os dados no localStorage do navegador
- **Carregar**: Recupera rascunho salvo anteriormente
- **Limpar**: Remove rascunho salvo

---

## 📁 Estrutura do Projeto

```
gerador-proposta-performance/
├── index.html              # Página principal
├── README.md               # Esta documentação
├── LICENSE                 # Licença de uso
├── CHANGELOG.md            # Histórico de versões
├── CONTRIBUTING.md         # Guia de contribuição
├── PLANO_MELHORIAS.md      # Plano de melhorias futuras
├── GUIA_USO.md             # Guia de uso completo
├── AVALIACAO_PROFISSIONAL.md
├── CHECKLIST_IMPLANTACAO.md
├── INDICE_DOCUMENTACAO.md
├── PRIVACIDADE_SEGURANCA.md
└── src/
    ├── manifest.json       # Manifesto PWA
    ├── css/
    │   └── style.css       # Folha de estilos
    ├── js/
    │   └── script.js       # Lógica da aplicação
    ├── assets/
    │   ├── Logotipo.png    # Logo da empresa
    │   ├── Logo1.png       # Logo alternativa
    │   ├── favicon.ico     # Favicon principal
    │   ├── favicon-16x16.png
    │   ├── favicon-32x32.png
    │   ├── favicon-192x192.png
    │   ├── favicon-512x512.png
    │   └── apple-touch-icon.png
    └── components/         # Componentes (futuro)
```

---

## 🔧 Personalização

### Alterar Cores
Edite as variáveis CSS em `src/css/style.css`:

```css
:root {
  --primary: #3b82f6;        /* Cor primária */
  --primary-dark: #2563eb;   /* Primária escura */
  --accent: #10b981;         /* Cor de destaque */
  --accent-dark: #059669;    /* Destaque escuro */
}
```

### Alterar Logo
Substitua a URL da logo em `index.html`:
```html
<img id="brandLogo" src="src/assets/URL_DA_SUA_LOGO" alt="Performance" />
```

### Alterar Informações de Faturamento
Edite a seção em `index.html` (linhas ~307-323):
```html
<div class="billing-info">
  <!-- Suas informações aqui -->
</div>
```

---

## 🐛 Solução de Problemas

### O rascunho não salva
- Verifique se o localStorage está habilitado no navegador
- Limpe o cache e cookies
- Tente usar outro navegador

### A impressão não funciona corretamente
- Certifique-se de ter clicado em "Visualizar" antes
- Verifique se todos os campos obrigatórios estão preenchidos
- Tente usar a opção "Salvar como PDF" da impressora

### Os ícones não aparecem
- Verifique sua conexão com a internet (Font Awesome via CDN)
- Ad-blockers podem bloquear recursos externos

---

## 📱 Compatibilidade

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome | 80+ | ✅ Testado |
| Firefox | 75+ | ✅ Testado |
| Edge | 80+ | ✅ Testado |
| Safari | 13+ | ✅ Testado |
| Opera | 65+ | ✅ Testado |

---

## 🔒 Segurança e Privacidade

- **Dados Locais**: Todas as informações são salvas apenas no seu navegador (localStorage)
- **Sem Backend**: Não há envio de dados para servidores externos
- **HTTPS Recomendado**: Ao hospedar, use HTTPS para proteger os dados
- **Limpeza Regular**: Recomenda-se limpar rascunhos antigos periodicamente

### Limitações do localStorage
- Máximo de ~5MB por domínio
- Dados persistem apenas no navegador/dispositivo atual
- São apagados ao limpar cache/cookies do navegador

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o guia em [CONTRIBUTING.md](CONTRIBUTING.md).

### Passos Básicos:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

Resumo: Você pode usar, modificar e distribuir livremente, desde que mantenha os créditos originais.

---

## 👨‍💻 Autor

**Filipe Goulart**  
Desenvolvedor do Gerador de Propostas

---

## 🏢 Empresa

**Grupo Performance Ocupacional**  
Saúde e Segurança Ocupacional

### Unidades:
- **Filial Itaguara/MG** - Documentação e Treinamentos
  - CNPJ: 27.708.974/0001-80
  
- **Matriz Itatiaiuçu/MG** - Exames Médicos Ocupacionais
  - CNPJ: 13.583.116/0001-42

---

## 📞 Contato

- **Website**: [inserir]
- **Email**: [inserir]
- **Telefone**: [inserir]

---

## 🙏 Agradecimentos

- Google Fonts pela tipografia Inter
- Font Awesome pelos ícones
- Comunidade open-source pelas ferramentas utilizadas

---

## 📈 Roadmap

Veja as melhorias planejadas em [PLANO_MELHORIAS.md](PLANO_MELHORIAS.md)

### Próximas Versões
- [ ] Exportação para PDF
- [ ] Envio por email
- [ ] Histórico de propostas
- [ ] Templates personalizáveis
- [ ] Assinatura digital

---

*Última atualização: Agosto 2025*  
*Versão: 2.1.0*
