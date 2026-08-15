# 🦷 OdontoSys - Sistema de Gestão para Consultório Odontológico

[![GitHub](https://img.shields.io/badge/GitHub-Susysvm%2FOdontoSys-blue?logo=github)](https://github.com/Susysvm/OdontoSys)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)]()
[![Versão](https://img.shields.io/badge/Versão-2.5-blue)]()
[![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-green?logo=google)]()

---

## 📋 Sobre o Projeto

**OdontoSys** é um sistema web completo para gerenciamento de consultórios odontológicos, desenvolvido em **Google Apps Script** com integração a **Google Sheets** como banco de dados e **HTML5/CSS3/JavaScript** no frontend.

### 🎯 Objetivo Principal
Centralizar a gestão de um consultório odontológico em uma única plataforma, integrando:
- ✅ Cadastro e prontuário eletrônico de pacientes
- ✅ Agendamento de consultas
- ✅ Controle financeiro e recebimentos
- ✅ Gerenciamento de estoque
- ✅ Histórico clínico e evolução do paciente
- ✅ Dashboard com indicadores em tempo real

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Descrição |
|-----------|-----------|
| **Google Apps Script** | Backend serverless |
| **Google Sheets** | Banco de dados |
| **HTML5/CSS3** | Frontend responsivo |
| **JavaScript (ES6+)** | Lógica do cliente |
| **Tailwind CSS** | Estilização |
| **Font Awesome** | Ícones |
| **GitHub** | Controle de versão |

---

## 📁 Estrutura do Projeto

```
OdontoSys/
├── 📄 index.html                  # Frontend principal
├── 📄 backend.gs                  # Backend Google Apps Script
├── 📄 Código.gs                   # Arquivo original (descontinuado)
├── 📄 odontosys-api-client.js     # Cliente JavaScript para API
├── 📄 especificação               # Especificações do projeto
├── 📚 QUICKSTART.md               # Guia rápido (comece aqui!)
├── 📚 GUIA_BACKEND.md             # Documentação técnica
├── 📚 INTEGRACAO_HTML.md          # Como integrar no frontend
├── 📚 README.md                   # Este arquivo
└── .git/                          # Repositório Git
```

---

## 📊 Banco de Dados (Google Sheets)

O sistema utiliza as seguintes abas no Google Sheets:

### 1. **Pacientes**
Informações completas de cada paciente
```
ID | Nome | CPF | Email | Telefone | DataNascimento | Endereço | Cidade | Estado | CEP | DataCadastro | Status | Obs
```

### 2. **Agendamentos**
Controle de consultas e procedimentos
```
ID | PacienteID | Data | Hora | Procedimento | Dentista | Status | Obs | DataCriacao
```

### 3. **Financeiro**
Registro de receitas e despesas
```
ID | PacienteID | Descricao | Valor | Data | Status | Tipo | FormaPagamento | Obs
```

### 4. **Estoque**
Gerenciamento de materiais e medicamentos
```
ID | Nome | Categoria | Quantidade | Unidade | ValorUnitario | Fornecedor | DataEntrada | ValidadeMeses | Obs
```

### 5. **Prontuário**
Histórico clínico de cada paciente
```
ID | PacienteID | Data | Hora | Dentista | Queixa | Diagnostico | Tratamento | Medicacao | Evolucao | Proxima | Obs
```

### 6. **Usuários**
Controle de acesso ao sistema
```
ID | Nome | Email | Senha | Perfil | Ativo
```

---

## 🔧 Instalação & Configuração

### Pré-requisitos
- Conta Google (Gmail/Workspace)
- GitHub account (opcional, para clonar o repositório)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### 5️⃣ Passos Rápidos

1. **Clonar o Repositório**
   ```bash
   git clone https://github.com/Susysvm/OdontoSys.git
   cd OdontoSys
   ```

2. **Copiar Backend para Google Apps Script**
   - Abra: https://script.google.com/u/0/home/projects/1yur8Txt3ZR4CimIJjMJd8RMtw-2e57uO04qP1Bu6UHZx0Jzz-3RqamFY/edit
   - Copie o conteúdo de `backend.gs`
   - Cole no editor do Google Apps Script
   - Clique em **Salvar**

3. **Executar Teste**
   - Selecione a função `testarAPI()` no dropdown
   - Clique em **Executar** (ícone play)
   - Verifique os logs (Ctrl+Enter)

4. **Fazer Deploy**
   - Clique em **Deploy**
   - Selecione **New deployment** → **Web app**
   - Em "Who has access" → **Anyone**
   - Clique em **Deploy**
   - **Copie a URL gerada**

5. **Integrar no Frontend**
   - Abra `index.html`
   - Procure por `DEPLOYMENT_ID` no final do arquivo
   - Substitua pela URL do seu deploy
   - Abra no navegador e teste!

📖 **Para mais detalhes**, leia o [`QUICKSTART.md`](QUICKSTART.md)

---

## 🎮 Como Usar

### API Endpoints

#### GET (Consultas)
```javascript
// Listar pacientes
await api.listarPacientes()

// Obter um paciente
await api.obterPaciente(id)

// Listar agendamentos
await api.listarAgendamentos()

// Obter informações financeiras
await api.obterFinanceiro()

// Obter itens do estoque
await api.obterEstoque()

// Obter prontuário de um paciente
await api.obterProntuario(pacienteId)

// Obter dashboard
await api.obterDashboard()
```

#### POST (Criação/Atualização)
```javascript
// Adicionar paciente
await api.adicionarPaciente({ nome, email, telefone, cpf })

// Atualizar paciente
await api.atualizarPaciente(id, { nome, email })

// Deletar paciente
await api.deletarPaciente(id)

// Adicionar agendamento
await api.adicionarAgendamento({ pacienteId, data, hora, procedimento })

// Adicionar financeiro
await api.adicionarRegistroFinanceiro({ pacienteId, descricao, valor })

// Adicionar ao estoque
await api.adicionarItemEstoque({ nome, categoria, quantidade })

// Adicionar prontuário
await api.adicionarAnotacaoProntuario({ pacienteId, queixa, diagnostico })
```

---

## 🛠️ Recursos

### Dashboard em Tempo Real
- 📊 Total de pacientes
- 📅 Agendamentos do dia
- 💰 Valores a receber/recebidos
- 📦 Itens com baixo estoque
- 🔌 Status de conexão com API

### Módulos Disponíveis

#### 👥 Pacientes
- Cadastro completo com validação de CPF
- Histórico de atendimentos
- Status (Ativo/Inativo)
- Busca e filtros

#### 📅 Agendamentos
- Marcação de consultas
- Controle de status (Agendado/Confirmado/Cancelado)
- Lembretes automáticos
- Visualização em calendário

#### 💼 Prontuário
- Anamnese completa
- Histórico clínico
- Diagnóstico e tratamentos
- Medicações prescritas
- Anotações de evolução

#### 💰 Financeiro
- Controle de receitas e despesas
- Status de pagamento
- Formas de pagamento (Dinheiro, Cartão, PIX, etc)
- Relatórios e extratos

#### 📦 Estoque
- Cadastro de materiais e medicamentos
- Alertas de validade
- Baixo estoque automático
- Fornecedores

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | **Comece aqui!** 5 passos para colocar em produção |
| [GUIA_BACKEND.md](GUIA_BACKEND.md) | Documentação técnica completa da API |
| [INTEGRACAO_HTML.md](INTEGRACAO_HTML.md) | Como integrar com o frontend |
| [README.md](README.md) | Este arquivo |

---

## 🔐 Segurança

### Funcionalidades Implementadas
- ✅ Validação de dados no cliente
- ✅ Tratamento de erros
- ✅ Deploy com acesso público controlado

### Melhorias Futuras
- 🔐 Autenticação via Google Sign-In
- 🔐 Rate limiting e proteção contra spam
- 🔐 Criptografia de dados sensíveis
- 🔐 Logs de auditoria
- 🔐 Backup automático

---

## 🐛 Troubleshooting

### Erro: "API não responde"
**Solução:** Verifique se o Deploy foi feito corretamente e se a URL está no formato correto.

### Erro: "Nenhum dado encontrado"
**Solução:** Crie as abas no Google Sheets com os nomes exatos: "Pacientes", "Agendamentos", etc.

### Erro: CORS
**Solução:** Execute um novo Deploy da API (redeploy). O CORS é reconfigurado automaticamente.

### API retorna null
**Solução:** Certifique-se que a `inicializarAPI(DEPLOYMENT_ID)` foi chamada e que o DEPLOYMENT_ID está correto.

📖 Para mais help, consulte [GUIA_BACKEND.md](GUIA_BACKEND.md#-troubleshooting)

---

## 📈 Roadmap

- [ ] Autenticação com Google Sign-In
- [ ] App mobile (React Native / Flutter)
- [ ] Integração com PIX
- [ ] Geração de recibos em PDF
- [ ] Backup automático
- [ ] Emissão de notas fiscais
- [ ] Relatórios avançados
- [ ] Chat com pacientes
- [ ] Integração com WhatsApp
- [ ] Prontuário com assinatura digital

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo LICENSE para mais detalhes.

---

## 📞 Suporte

- 📧 Email: susysvm@example.com
- 💬 GitHub Issues: [Abrir issue](https://github.com/Susysvm/OdontoSys/issues)
- 📱 WhatsApp: [Chat](https://wa.me/55)

---

## 👤 Autor

**Susy Martins**
- GitHub: [@Susysvm](https://github.com/Susysvm)
- Projeto OdontoSys: Sistema de gestão para consultório odontológico

---

## 🙏 Agradecimentos

Obrigada a:
- Google Apps Script team
- Google Sheets para hospedagem de dados
- Comunidade open source
- Tailwind CSS por um framework CSS incrível
- Font Awesome pelos ícones

---

## 📊 Estatísticas do Projeto

```
Arquivos:     9
Linhas de código (backend):   ~1,200
Linhas de código (frontend):  ~2,500
Endpoints da API:  20+
Planilhas:         6
Versão:            2.5
Status:            Em Desenvolvimento ⚙️
```

---

## 🎉 Começar Agora!

1. ⭐ Star este repositório
2. 📖 Leia o [QUICKSTART.md](QUICKSTART.md)
3. 🚀 Siga os 5 passos
4. 🎊 Pronto! Seu consultório está digital!

---

**Desenvolvido com ❤️ para consultórios odontológicos**

Última atualização: 15/08/2026
