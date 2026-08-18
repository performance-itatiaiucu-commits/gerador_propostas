# 🔒 Política de Segurança e Privacidade

## Gerador de Proposta Comercial — Grupo Performance Ocupacional

**Última atualização:** Agosto 2025  
**Versão:** 2.1.0

---

## 1. Visão Geral

Este documento descreve como o **Gerador de Proposta Comercial** coleta, usa, armazena e protege as informações dos usuários. Este é um aplicativo web que opera **inteiramente no navegador do usuário**, sem backend ou servidor próprio.

---

## 2. Coleta de Dados

### 2.1 Dados Coletados

O sistema permite que usuários insiram os seguintes dados:

#### Dados do Cliente (inseridos pelo usuário):
- Razão social / Nome fantasia
- Unidade/Contrato
- Nome do responsável
- Telefone
- Email
- CNPJ/CPF
- Endereço completo
- Cidade e UF
- Observações sobre negociação
- Logo da empresa (upload opcional)

#### Dados da Proposta:
- Itens/serviços com descrições
- Quantidades e valores unitários
- Descontos aplicados
- Forma de pagamento
- Prazo de entrega

### 2.2 Como os Dados são Coletados

Os dados são **digitados manualmente** pelo usuário através do formulário web. Não há coleta automática de informações.

---

## 3. Armazenamento de Dados

### 3.1 LocalStorage do Navegador

**IMPORTANTE:** Todos os dados são armazenados **exclusivamente** no `localStorage` do navegador do usuário.

**Características:**
- ✅ Os dados permanecem apenas no dispositivo do usuário
- ✅ Não há envio para servidores externos
- ✅ Cada navegador/dispositivo tem seus próprios dados
- ✅ Limite máximo: ~5MB por domínio

**Localização física:**
```
Windows: C:\Users\[Usuario]\AppData\Local\[Navegador]\User Data\Default\Local Storage
macOS: ~/Library/Application Support/[Navegador]/Default/Local Storage
Linux: ~/.config/[Navegador]/Default/Local Storage
```

### 3.2 Duração do Armazenamento

Os dados persistem no localStorage até que:
- O usuário clique em "Limpar" no sistema
- O usuário limpe manualmente o cache/cookies do navegador
- O navegador seja configurado para limpar dados automaticamente
- O armazenamento atinja o limite de capacidade

### 3.3 Upload de Logo

Quando o usuário faz upload de uma logo:
- A imagem é convertida para Base64
- É armazenada temporariamente na memória durante a sessão
- Se o usuário salvar o rascunho, a logo é salva no localStorage
- **Não há upload para servidores externos**

---

## 4. Uso dos Dados

Os dados inseridos são usados **exclusivamente** para:

1. **Geração da Proposta**: Preencher o modelo de proposta comercial
2. **Preview em Tempo Real**: Mostrar como ficará a proposta impressa
3. **Salvamento de Rascunho**: Permitir que o usuário continue depois
4. **Impressão/Exportação**: Gerar documento físico ou PDF

**NÃO fazemos:**
- ❌ Venda ou compartilhamento de dados
- ❌ Marketing ou publicidade
- ❌ Análise de dados para terceiros
- ❌ Transferência internacional de dados

---

## 5. Compartilhamento de Dados

### 5.1 Terceiros

O sistema utiliza os seguintes serviços externos via CDN:

| Serviço | Finalidade | Dados Compartilhados |
|---------|------------|---------------------|
| Google Fonts | Tipografia Inter | Nenhum dado pessoal |
| Font Awesome | Ícones | Nenhum dado pessoal |

**Importante:** Estes serviços carregam recursos estáticos (CSS, fontes, ícones). Nenhuma informação digitada no formulário é enviada para estes serviços.

### 5.2 Quando o Usuário Compartilha

O usuário pode optar por compartilhar a proposta gerada:
- **Impressão em papel**: Para clientes ou colegas
- **Exportação para PDF**: Pode ser enviado por email, WhatsApp, etc.
- **Screenshot**: Captura de tela do preview

**Estas ações são de responsabilidade exclusiva do usuário.**

---

## 6. Segurança

### 6.1 Medidas Implementadas

1. **Sanitização de Inputs**
   - Todos os campos são sanitizados antes de exibir no preview
   - Prevenção contra ataques XSS (Cross-Site Scripting)
   - Escape de caracteres especiais (&, <, >, ", ')

2. **Validação de Arquivos**
   - Upload de logo aceita apenas imagens
   - Validação do tipo MIME do arquivo
   - Recomenda-se limitar tamanho máximo (sugestão: 2MB)

3. **Armazenamento Local Seguro**
   - Dados acessíveis apenas pelo próprio navegador
   - Isolamento por origem (same-origin policy)
   - Sem exposição a outros sites

### 6.2 Limitações de Segurança

⚠️ **Atenção às seguintes limitações:**

1. **LocalStorage não é criptografado**
   - Dados podem ser lidos por qualquer script rodando na mesma origem
   - Usuários com acesso físico ao dispositivo podem acessar os dados

2. **Sem autenticação**
   - Qualquer pessoa com acesso ao navegador pode ver os dados salvos
   - Não há sistema de login ou senhas

3. **HTTPS Recomendado**
   - Ao hospedar o sistema, use HTTPS para proteger o tráfego
   - Previne interceptação de dados em redes públicas

### 6.3 Boas Práticas para Usuários

Recomendamos aos usuários:
- ✅ Usar em dispositivos seguros e pessoais
- ✅ Limpar rascunhos após usar em computadores compartilhados
- ✅ Não inserir dados sensíveis além do necessário
- ✅ Fazer logout/limpar dados em computadores públicos
- ✅ Manter navegador e antivírus atualizados

---

## 7. Direitos dos Usuários

Como os dados estão sob controle total do usuário, ele tem direito a:

1. **Acesso**: Visualizar todos os dados salvos no sistema
2. **Correção**: Editar qualquer informação a qualquer momento
3. **Exclusão**: Remover dados clicando em "Limpar"
4. **Portabilidade**: Exportar dados via impressão/PDF
5. **Oposição**: Não usar o sistema se não concordar com esta política

Para exercer estes direitos, use as funcionalidades do próprio sistema:
- **Visualizar dados**: Preencha o formulário e veja o preview
- **Corrigir dados**: Volte às etapas do wizard e edite
- **Excluir dados**: Clique no botão "Limpar"
- **Exportar dados**: Use o botão "Imprimir" e salve como PDF

---

## 8. Menores de Idade

Este sistema é destinado a **uso profissional** e não deve ser usado por menores de 18 anos sem supervisão de um responsável.

---

## 9. Alterações nesta Política

Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas através de:
- Atualização do documento no repositório
- Nota no CHANGELOG.md
- Aviso no sistema (quando implementado)

Recomendamos revisão periódica desta política.

---

## 10. LGPD (Lei Geral de Proteção de Dados)

Este sistema está em conformidade com a LGPD (Lei 13.709/2018) porque:

✅ **Finalidade clara**: Geração de propostas comerciais  
✅ **Consentimento implícito**: Usuário fornece dados voluntariamente  
✅ **Minimização**: Apenas dados necessários são solicitados  
✅ **Armazenamento local**: Dados sob controle do usuário  
✅ **Sem compartilhamento**: Dados não são transferidos a terceiros  
✅ **Direitos garantidos**: Acesso, correção, exclusão facilitados  

### 10.1 Controlador dos Dados

**Importante:** O usuário que preenche o formulário é o **controlador** dos dados inseridos. O sistema é apenas uma **ferramenta de processamento**.

Se você está usando este sistema para coletar dados de clientes:
- Você é responsável por obter consentimento adequado
- Você deve garantir base legal para o tratamento
- Você deve respeitar os direitos dos titulares de dados

---

## 11. Contato

Para dúvidas sobre segurança e privacidade:

**Grupo Performance Ocupacional**
- Email: [inserir email de contato]
- Telefone: [inserir telefone]
- Endereço: [inserir endereço]

**Encarregado de Dados (DPO)**: [inserir se aplicável]

---

## 12. Termos Adicionais para Hospedagem

Se você for hospedar este sistema em seu próprio servidor:

### Responsabilidades do Hospedeiro:
1. Implementar HTTPS com certificado SSL válido
2. Configurar headers de segurança adequados
3. Manter o servidor seguro e atualizado
4. Informar usuários sobre esta política de privacidade
5. Cumprir legislações locais de proteção de dados

### Headers de Segurança Recomendados:

```nginx
# Exemplo para Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;" always;
```

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **LocalStorage** | Mecanismo de armazenamento no navegador |
| **Base64** | Formato de codificação de dados binários |
| **XSS** | Cross-Site Scripting, tipo de ataque web |
| **HTTPS** | Protocolo seguro de comunicação web |
| **CDN** | Rede de Distribuição de Conteúdo |
| **Controlador** | Quem decide sobre o tratamento de dados |
| **Operador** | Quem processa dados em nome do controlador |

---

## 14. Aceite

Ao utilizar este sistema, o usuário declara que:
- Leu e compreendeu esta política de privacidade
- Concorda com o armazenamento local de dados
- Assume responsabilidade pelos dados que insere
- Usará o sistema de forma ética e legal

---

*Documento baseado nas melhores práticas de privacidade e conformidade com LGPD/GDPR*  
*Versão: 1.0 | Agosto 2025*
