# OdontoSys Backend - Guia de Implementação

## 🚀 Como Usar Este Backend

### 1️⃣ Setup no Google Apps Script

1. Acesse: https://script.google.com/u/0/home/projects/1yur8Txt3ZR4CimIJjMJd8RMtw-2e57uO04qP1Bu6UHZx0Jzz-3RqamFY/edit
2. Apague o conteúdo atual
3. Cole TODO o código do arquivo `backend.gs`
4. Clique em "Salvar"
5. Execute a função `testarAPI()` para verificar se tudo está funcionando

### 2️⃣ Fazer Deploy da API

1. Clique em "Deploy" (canto superior direito)
2. Selecione "New Deployment"
3. Escolha o tipo: "Web app"
4. Em "Execute as" selecione sua conta
5. Em "Who has access" selecione "Anyone"
6. Clique em "Deploy"
7. Copie a URL gerada (será usada no frontend)

**URL padrão será algo como:**
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercript
```

### 3️⃣ Integrar com o Frontend

No seu `index.html`, adicione isto antes da tag `</body>`:

```html
<script>
  // Configuração da API
  const API_URL = "https://script.google.com/macros/d/SEU_DEPLOYMENT_ID/usercript";

  // Funções de Requisição
  async function apiGet(action, params = {}) {
    const queryString = new URLSearchParams({ action, ...params });
    const response = await fetch(`${API_URL}?${queryString}`);
    return response.json();
  }

  async function apiPost(action, data) {
    const response = await fetch(API_URL, {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify({ action, ...data })
    });
    return response.json();
  }

  // Exemplos de Uso
  
  // ✅ PACIENTES
  async function listarPacientes() {
    const resultado = await apiGet("getPacientes");
    console.log(resultado);
  }

  async function obterPaciente(id) {
    const resultado = await apiGet("getPaciente", { id });
    console.log(resultado);
  }

  async function adicionarPaciente() {
    const resultado = await apiPost("addPaciente", {
      nome: "João Silva",
      cpf: "123.456.789-00",
      email: "joao@email.com",
      telefone: "(11) 99999-9999",
      dataNascimento: "01/01/1990",
      endereco: "Rua Exemplo, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100"
    });
    console.log(resultado);
  }

  // ✅ AGENDAMENTOS
  async function listarAgendamentos() {
    const resultado = await apiGet("getAgendamentos");
    console.log(resultado);
  }

  async function adicionarAgendamento() {
    const resultado = await apiPost("addAgendamento", {
      pacienteId: "ID_1234567890",
      data: "15/08/2026",
      hora: "14:30",
      procedimento: "Limpeza",
      dentista: "Dra. Aline",
      status: "Agendado"
    });
    console.log(resultado);
  }

  // ✅ FINANCEIRO
  async function obterFinanceiro() {
    const resultado = await apiGet("getFinanceiro");
    console.log(resultado);
  }

  async function adicionarFinanceiro() {
    const resultado = await apiPost("addFinanceiro", {
      pacienteId: "ID_1234567890",
      descricao: "Limpeza Dental",
      valor: "150.00",
      status: "Pendente",
      tipo: "Receita",
      formaPagamento: "PIX"
    });
    console.log(resultado);
  }

  // ✅ ESTOQUE
  async function obterEstoque() {
    const resultado = await apiGet("getEstoque");
    console.log(resultado);
  }

  async function adicionarItemEstoque() {
    const resultado = await apiPost("addEstoque", {
      nome: "Resina Composta",
      categoria: "Materiais",
      quantidade: 50,
      unidade: "Unidade",
      valorUnitario: "25.00",
      fornecedor: "Fornecedor X",
      validadeMeses: "24"
    });
    console.log(resultado);
  }

  // ✅ PRONTUÁRIO
  async function obterProntuario(pacienteId) {
    const resultado = await apiGet("getProntuario", { pacienteId });
    console.log(resultado);
  }

  async function adicionarAnotacaoProntuario() {
    const resultado = await apiPost("addProntuario", {
      pacienteId: "ID_1234567890",
      dentista: "Dra. Aline",
      queixa: "Dor de dente",
      diagnostico: "Cárie profunda",
      tratamento: "Restauração",
      medicacao: "Dipirona 500mg"
    });
    console.log(resultado);
  }

  // ✅ DASHBOARD
  async function obterDashboard() {
    const resultado = await apiGet("getDashboard");
    console.log(resultado);
  }
</script>
```

---

## 📊 Estrutura de Dados (Sheets)

### 1. Planilha "Pacientes"
Colunas necessárias:
```
ID | Nome | CPF | Email | Telefone | DataNascimento | Endereço | Cidade | Estado | CEP | DataCadastro | Status | Obs
```

### 2. Planilha "Agendamentos"
```
ID | PacienteID | Data | Hora | Procedimento | Dentista | Status | Obs | DataCriacao
```

### 3. Planilha "Financeiro"
```
ID | PacienteID | Descricao | Valor | Data | Status | Tipo | FormaPagamento | Obs
```

### 4. Planilha "Estoque"
```
ID | Nome | Categoria | Quantidade | Unidade | ValorUnitario | Fornecedor | DataEntrada | ValidadeMeses | Obs
```

### 5. Planilha "Prontuário"
```
ID | PacienteID | Data | Hora | Dentista | Queixa | Diagnostico | Tratamento | Medicacao | Evolucao | Proxima | Obs
```

### 6. Planilha "Usuários"
```
ID | Nome | Email | Senha | Perfil | Ativo
```

---

## 🔗 Endpoints Disponíveis

### GET Endpoints (Consultas)

```bash
# Listar todos os pacientes
GET ?action=getPacientes

# Obter um paciente específico
GET ?action=getPaciente&id=ID_1234567890

# Listar agendamentos
GET ?action=getAgendamentos

# Obter informações financeiras
GET ?action=getFinanceiro

# Obter itens do estoque
GET ?action=getEstoque

# Obter prontuário de um paciente
GET ?action=getProntuario&pacienteId=ID_1234567890

# Obter resumo do dashboard
GET ?action=getDashboard
```

### POST Endpoints (Criação/Atualização)

```bash
# Adicionar paciente
POST { "action": "addPaciente", "nome": "...", "cpf": "...", ... }

# Atualizar paciente
POST { "action": "updatePaciente", "id": "...", "nome": "...", ... }

# Deletar paciente
POST { "action": "deletePaciente", "id": "ID_1234567890" }

# Adicionar agendamento
POST { "action": "addAgendamento", "pacienteId": "...", ... }

# Atualizar agendamento
POST { "action": "updateAgendamento", "id": "...", ... }

# Deletar agendamento
POST { "action": "deleteAgendamento", "id": "ID_1234567890" }

# Adicionar registro financeiro
POST { "action": "addFinanceiro", ... }

# Atualizar registro financeiro
POST { "action": "updateFinanceiro", "id": "...", ... }

# Adicionar item ao estoque
POST { "action": "addEstoque", ... }

# Atualizar item do estoque
POST { "action": "updateEstoque", "id": "...", ... }

# Adicionar nota no prontuário
POST { "action": "addProntuario", ... }

# Atualizar nota do prontuário
POST { "action": "updateProntuario", "id": "...", ... }
```

---

## ✅ Exemplo Completo: Adicionar um Paciente

### 1. HTML Form
```html
<form id="formPaciente">
  <input type="text" id="nome" placeholder="Nome completo" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="tel" id="telefone" placeholder="Telefone" required>
  <button type="submit">Salvar Paciente</button>
</form>
```

### 2. JavaScript Handler
```javascript
document.getElementById("formPaciente").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value
  };
  
  const resultado = await apiPost("addPaciente", dados);
  
  if (resultado.success) {
    alert("✅ Paciente adicionado com sucesso!");
    document.getElementById("formPaciente").reset();
  } else {
    alert("❌ Erro: " + resultado.error);
  }
});
```

---

## 🔐 Segurança (Melhorias Futuras)

Para uma produção segura, considere adicionar:

1. **Autenticação via API Key**
```javascript
const API_KEY = "sua-chave-secreta";
// Adicionar header: "Authorization": "Bearer " + API_KEY
```

2. **Rate Limiting** - Limitar requisições por minuto
3. **Validação de Dados** - Validar tipos e tamanhos
4. **Logs de Auditoria** - Registrar todas as operações
5. **Criptografia de Dados Sensíveis** - CPF, Telefone, Email

---

## 📝 Notas Importantes

- **IDs são gerados automaticamente** no formato: `ID_timestamp_random`
- **Datas e horas** são adicionadas automaticamente (data atual do servidor)
- **Status padrão** de novos registros é "Ativo" ou "Agendado"
- Antes de fazer Deploy, **execute `testarAPI()`** para verificar a conexão

---

## 🐛 Troubleshooting

**Erro: "Nenhum dado encontrado"**
- Verifique se a planilha existe com o nome correto
- Crie a planilha automaticamente usando a função

**Erro de CORS**
- Certifique-se que "Anyone" tem acesso ao script
- Redeploy da API é necessário após mudanças

**ID não encontrado**
- Copie o ID exato de um registro existente
- Verifique se a coluna "ID" existe na planilha

---

## 📞 Contato & Suporte

Para mais informações ou bugs, abra uma issue no repositório ou entre em contato.

**Versão:** 1.0  
**Atualizado:** 15/08/2026  
**Desenvolvedor:** OdontoSys Team
