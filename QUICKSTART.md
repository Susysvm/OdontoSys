# 🚀 OdontoSys - Quick Start

## Resumo do que foi criado:

✅ **backend.gs** - Código do Google Apps Script com todas as funções CRUD
✅ **odontosys-api-client.js** - Cliente JavaScript pronto para usar no frontend
✅ **GUIA_BACKEND.md** - Documentação completa com exemplos

---

## ⚡ 5 Passos para Colocar em Produção

### Passo 1: Copiar o código para o Google Apps Script
1. Abra: https://script.google.com/u/0/home/projects/1yur8Txt3ZR4CimIJjMJd8RMtw-2e57uO04qP1Bu6UHZx0Jzz-3RqamFY/edit
2. Apague tudo que está lá
3. Cole o conteúdo completo do arquivo `backend.gs`
4. Clique em **Salvar** (Ctrl+S)

### Passo 2: Executar o teste
1. No topo do editor, procure pelo menu de funções
2. Selecione `testarAPI` no dropdown
3. Clique em **Executar** (ícone play)
4. Verifique os logs (Ctrl+Enter) - deve aparecer "✓ Conexão com Spreadsheet: OK"

### Passo 3: Fazer o Deploy
1. Clique em **Deploy** (canto superior direito)
2. Clique em **New deployment** (ou "Nova implantação")
3. Selecione tipo: **Web app**
4. Em "Execute as": selecione sua conta Google
5. Em "Who has access": selecione **Anyone**
6. Clique em **Deploy**
7. **Copie a URL gerada** - você vai precisar dela

**Exemplo de URL:**
```
https://script.google.com/macros/d/AKfycbx1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o/usercript
```

### Passo 4: Integrar no Frontend
1. Abra seu `index.html`
2. Adicione isto **antes de `</body>`**:

```html
<!-- OdontoSys API Client -->
<script src="odontosys-api-client.js"></script>

<script>
  // Substitua pela URL do seu Deploy
  const DEPLOYMENT_ID = "AKfycbx1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o";
  
  // Inicializar API quando página carrega
  window.addEventListener('load', () => {
    inicializarAPI(DEPLOYMENT_ID);
    atualizarDashboard();
  });
</script>
```

### Passo 5: Atualizar index.html com funções
Atualize o seu `index.html` para incluir os scripts de integração. Procure pelos IDs:
- `#total-pacientes` - mostrará total de pacientes
- `#agendamentos-hoje` - mostrará agendamentos do dia
- `#total-receber` - mostrará valores a receber
- `#total-recebido` - mostrará valores recebidos
- `#items-baixo-estoque` - mostrará itens com baixo estoque

---

## 📱 Exemplo: Formulário de Novo Paciente

Adicione isto no seu `index.html`:

```html
<form id="formNovoPaciente" style="max-width: 500px; margin: 20px auto;">
  <h2>Novo Paciente</h2>
  
  <input type="text" id="nome" placeholder="Nome completo" required 
    style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px;">
  
  <input type="email" id="email" placeholder="Email" required 
    style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px;">
  
  <input type="tel" id="telefone" placeholder="(11) 99999-9999" required 
    style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px;">
  
  <input type="text" id="cpf" placeholder="123.456.789-00" 
    style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px;">
  
  <button type="submit" style="width: 100%; padding: 10px; background: #00a86b; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
    Adicionar Paciente
  </button>
  
  <div id="mensagem" style="margin-top: 10px; text-align: center; font-weight: bold;"></div>
</form>

<script>
document.getElementById('formNovoPaciente').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const mensagemDiv = document.getElementById('mensagem');
  
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const telefone = document.getElementById('telefone').value;
  const cpf = document.getElementById('cpf').value;
  
  // Validações
  if (!OdontoSysAPI.validarEmail(email)) {
    mensagemDiv.textContent = '❌ Email inválido';
    mensagemDiv.style.color = 'red';
    return;
  }
  
  if (cpf && !OdontoSysAPI.validarCPF(cpf)) {
    mensagemDiv.textContent = '❌ CPF inválido';
    mensagemDiv.style.color = 'red';
    return;
  }
  
  // Enviar para API
  const resultado = await api.adicionarPaciente({
    nome,
    email,
    telefone: OdontoSysAPI.mascaraTelefone(telefone),
    cpf: cpf ? OdontoSysAPI.mascaraCPF(cpf) : ''
  });
  
  if (resultado.success) {
    mensagemDiv.textContent = '✅ Paciente adicionado com sucesso!';
    mensagemDiv.style.color = 'green';
    document.getElementById('formNovoPaciente').reset();
    setTimeout(() => atualizarDashboard(), 1000);
  } else {
    mensagemDiv.textContent = '❌ Erro: ' + resultado.error;
    mensagemDiv.style.color = 'red';
  }
});
</script>
```

---

## 🔍 Estrutura da Planilha

Antes de usar, **crie estas 6 abas no Google Sheets**:

```
📊 Pacientes
├── ID
├── Nome
├── CPF
├── Email
├── Telefone
├── DataNascimento
├── Endereço
├── Cidade
├── Estado
├── CEP
├── DataCadastro
├── Status
└── Obs

📅 Agendamentos
├── ID
├── PacienteID
├── Data
├── Hora
├── Procedimento
├── Dentista
├── Status
├── Obs
└── DataCriacao

💰 Financeiro
├── ID
├── PacienteID
├── Descricao
├── Valor
├── Data
├── Status
├── Tipo
├── FormaPagamento
└── Obs

📦 Estoque
├── ID
├── Nome
├── Categoria
├── Quantidade
├── Unidade
├── ValorUnitario
├── Fornecedor
├── DataEntrada
├── ValidadeMeses
└── Obs

📝 Prontuário
├── ID
├── PacienteID
├── Data
├── Hora
├── Dentista
├── Queixa
├── Diagnostico
├── Tratamento
├── Medicacao
├── Evolucao
├── Proxima
└── Obs

👥 Usuários
├── ID
├── Nome
├── Email
├── Senha
├── Perfil
└── Ativo
```

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| "API não responde" | Verifique se o Deploy foi feito e se a URL está correta |
| "Nenhum dado encontrado" | Crie a aba no Google Sheets com o nome exato |
| "Erro 403" | Mude as permissões do Deploy para "Anyone" |
| "Erro CORS" | Execute o Deploy novamente (redeploy) |
| "TypeError: api is null" | Certifique-se que `inicializarAPI(DEPLOYMENT_ID)` foi chamado |

---

## 📚 API Disponível

```javascript
// Listar todos os pacientes
await api.listarPacientes()

// Obter um paciente
await api.obterPaciente(id)

// Adicionar paciente
await api.adicionarPaciente({ nome, email, telefone, cpf, ... })

// Atualizar paciente
await api.atualizarPaciente(id, { nome, email, ... })

// Deletar paciente
await api.deletarPaciente(id)

// Listar agendamentos
await api.listarAgendamentos()

// Adicionar agendamento
await api.adicionarAgendamento({ pacienteId, data, hora, procedimento, ... })

// Financeiro
await api.obterFinanceiro()
await api.adicionarRegistroFinanceiro({ pacienteId, descricao, valor, ... })

// Estoque
await api.obterEstoque()
await api.adicionarItemEstoque({ nome, categoria, quantidade, ... })

// Prontuário
await api.obterProntuario(pacienteId)
await api.adicionarAnotacaoProntuario({ pacienteId, queixa, diagnostico, ... })

// Dashboard
await api.obterDashboard()

// Utilidades
OdontoSysAPI.formatarMoeda(150) // "R$ 150,00"
OdontoSysAPI.mascaraCPF("12345678901") // "123.456.789-01"
OdontoSysAPI.mascaraTelefone("11999999999") // "(11) 99999-9999"
OdontoSysAPI.validarEmail("email@test.com") // true/false
OdontoSysAPI.validarCPF("123.456.789-01") // true/false
```

---

## ✅ Checklist Final

- [ ] Copiei o código do backend.gs pro Google Apps Script
- [ ] Executei o teste (`testarAPI()`)
- [ ] Fiz o Deploy e copiei a URL
- [ ] Criei as 6 abas no Google Sheets
- [ ] Integrei `odontosys-api-client.js` no meu index.html
- [ ] Adicionei a `inicializarAPI(DEPLOYMENT_ID)` no meu HTML
- [ ] Testei um endpoint (ex: listarPacientes)
- [ ] Atualizei os IDs dos elementos para o Dashboard

---

## 🎉 Pronto!

Seu backend OdontoSys está funcionando! Agora você pode:
- ✅ Criar, ler, atualizar e deletar pacientes
- ✅ Gerenciar agendamentos
- ✅ Controlar financeiro
- ✅ Gerenciar estoque
- ✅ Manter prontuários eletrônicos
- ✅ Ver dashboard em tempo real

Boa sorte com seu consultório! 🦷🎊

---

**Dúvidas?** Consulte o `GUIA_BACKEND.md` para documentação completa.
