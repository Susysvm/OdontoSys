# Guia de Integração: Atualizando o index.html

## 📌 O que você precisa fazer:

1. **Adicionar o script do API client** no final do index.html
2. **Adicionar IDs aos elementos** que vão exibir dados
3. **Criar funções JavaScript** para atualizar os dados em tempo real

---

## 🔧 Código para Adicionar ao Final do index.html

Procure pela tag `</body>` no seu index.html e **antes dela**, adicione:

```html
<!-- ==================== OdontoSys API Integration ==================== -->

<!-- Cliente da API -->
<script src="odontosys-api-client.js"></script>

<script>
  // ⚠️ SUBSTITUA PELA URL DO SEU DEPLOYMENT ⚠️
  const DEPLOYMENT_ID = "SEU_DEPLOYMENT_ID_AQUI";
  
  // Inicializar API
  let api = null;
  
  window.addEventListener('load', async () => {
    console.log('🚀 Inicializando OdontoSys...');
    
    // Iniciar API
    inicializarAPI(DEPLOYMENT_ID);
    
    // Testar conexão
    const conectado = await api.testarConexao();
    if (conectado) {
      console.log('✅ API Conectada com sucesso!');
      atualizarStatusAPI(true);
      carregarDados();
    } else {
      console.error('❌ Erro de conexão com API');
      atualizarStatusAPI(false);
    }
  });

  // ==================== Dashboard ====================
  async function carregarDados() {
    console.log('📊 Carregando dados do dashboard...');
    await atualizarDashboard();
    await carregarPacientes();
    await carregarAgendamentos();
    await carregarFinanceiro();
    await carregarEstoque();
  }

  async function atualizarDashboard() {
    try {
      const resultado = await api.obterDashboard();
      
      if (resultado.success && resultado.resumo) {
        const resumo = resultado.resumo;
        
        // Atualizar elementos do dashboard
        const totalPacientesEl = document.getElementById('total-pacientes');
        const agendamentosHojeEl = document.getElementById('agendamentos-hoje');
        const totalReceberEl = document.getElementById('total-receber');
        const totalRecebidoEl = document.getElementById('total-recebido');
        const itensBaixoEstoqueEl = document.getElementById('items-baixo-estoque');
        
        if (totalPacientesEl) totalPacientesEl.textContent = resumo.totalPacientes || 0;
        if (agendamentosHojeEl) agendamentosHojeEl.textContent = resumo.agendamentosHoje || 0;
        if (totalReceberEl) totalReceberEl.textContent = OdontoSysAPI.formatarMoeda(resumo.totalReceber || 0);
        if (totalRecebidoEl) totalRecebidoEl.textContent = OdontoSysAPI.formatarMoeda(resumo.totalRecebido || 0);
        if (itensBaixoEstoqueEl) itensBaixoEstoqueEl.textContent = resumo.itensBaixoEstoque || 0;
      }
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
    }
  }

  // ==================== Pacientes ====================
  async function carregarPacientes() {
    try {
      const resultado = await api.listarPacientes();
      
      if (resultado.success && resultado.data) {
        preencherTabelaPacientes(resultado.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  }

  function preencherTabelaPacientes(pacientes) {
    const tabelaPacientes = document.getElementById('tabela-pacientes');
    if (!tabelaPacientes) return;
    
    const tbody = tabelaPacientes.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    pacientes.slice(0, 10).forEach(paciente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-4 py-2">${paciente.Nome || '-'}</td>
        <td class="px-4 py-2">${OdontoSysAPI.mascaraCPF(paciente.CPF || '')}</td>
        <td class="px-4 py-2">${OdontoSysAPI.mascaraTelefone(paciente.Telefone || '')}</td>
        <td class="px-4 py-2"><span class="badge bg-green-100 text-green-800">${paciente.Status || 'Ativo'}</span></td>
        <td class="px-4 py-2 text-right">
          <button onclick="abrirPaciente('${paciente.ID}')" class="btn btn-sm btn-primary">Ver</button>
          <button onclick="abrirDeletePaciente('${paciente.ID}')" class="btn btn-sm btn-danger">Deletar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  async function adicionarNovoPaciente() {
    const nome = document.getElementById('input-nome-paciente').value;
    const email = document.getElementById('input-email-paciente').value;
    const telefone = document.getElementById('input-telefone-paciente').value;
    const cpf = document.getElementById('input-cpf-paciente').value;
    
    if (!nome || !email) {
      alert('❌ Nome e email são obrigatórios');
      return;
    }
    
    if (!OdontoSysAPI.validarEmail(email)) {
      alert('❌ Email inválido');
      return;
    }
    
    const resultado = await api.adicionarPaciente({
      nome,
      email,
      telefone: OdontoSysAPI.mascaraTelefone(telefone),
      cpf: cpf ? OdontoSysAPI.mascaraCPF(cpf) : ''
    });
    
    if (resultado.success) {
      alert('✅ Paciente adicionado com sucesso!');
      document.getElementById('input-nome-paciente').value = '';
      document.getElementById('input-email-paciente').value = '';
      document.getElementById('input-telefone-paciente').value = '';
      document.getElementById('input-cpf-paciente').value = '';
      carregarPacientes();
      atualizarDashboard();
    } else {
      alert('❌ Erro: ' + resultado.error);
    }
  }

  async function abrirDeletePaciente(id) {
    if (confirm('Tem certeza que deseja deletar este paciente? Esta ação não pode ser desfeita.')) {
      const resultado = await api.deletarPaciente(id);
      
      if (resultado.success) {
        alert('✅ Paciente deletado com sucesso');
        carregarPacientes();
        atualizarDashboard();
      } else {
        alert('❌ Erro: ' + resultado.error);
      }
    }
  }

  // ==================== Agendamentos ====================
  async function carregarAgendamentos() {
    try {
      const resultado = await api.listarAgendamentos();
      
      if (resultado.success && resultado.data) {
        preencherTabelaAgendamentos(resultado.data);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  }

  function preencherTabelaAgendamentos(agendamentos) {
    const tabelaAgendamentos = document.getElementById('tabela-agendamentos');
    if (!tabelaAgendamentos) return;
    
    const tbody = tabelaAgendamentos.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    agendamentos.slice(0, 10).forEach(agendamento => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-4 py-2">${agendamento.Data || '-'}</td>
        <td class="px-4 py-2">${agendamento.Hora || '-'}</td>
        <td class="px-4 py-2">${agendamento.Procedimento || '-'}</td>
        <td class="px-4 py-2">${agendamento.Dentista || '-'}</td>
        <td class="px-4 py-2">
          <span class="badge ${agendamento.Status === 'Agendado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
            ${agendamento.Status || 'Agendado'}
          </span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // ==================== Financeiro ====================
  async function carregarFinanceiro() {
    try {
      const resultado = await api.obterFinanceiro();
      
      if (resultado.success && resultado.data) {
        preencherTabelaFinanceiro(resultado.data);
      }
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
    }
  }

  function preencherTabelaFinanceiro(registros) {
    const tabelaFinanceiro = document.getElementById('tabela-financeiro');
    if (!tabelaFinanceiro) return;
    
    const tbody = tabelaFinanceiro.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    registros.slice(0, 10).forEach(registro => {
      const row = document.createElement('tr');
      const statusClass = registro.Status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
      
      row.innerHTML = `
        <td class="px-4 py-2">${registro.Descricao || '-'}</td>
        <td class="px-4 py-2">${OdontoSysAPI.formatarMoeda(registro.Valor || 0)}</td>
        <td class="px-4 py-2">${registro.Data || '-'}</td>
        <td class="px-4 py-2">
          <span class="badge ${statusClass}">${registro.Status || 'Pendente'}</span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // ==================== Estoque ====================
  async function carregarEstoque() {
    try {
      const resultado = await api.obterEstoque();
      
      if (resultado.success && resultado.data) {
        preencherTabelaEstoque(resultado.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    }
  }

  function preencherTabelaEstoque(itens) {
    const tabelaEstoque = document.getElementById('tabela-estoque');
    if (!tabelaEstoque) return;
    
    const tbody = tabelaEstoque.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    itens.slice(0, 10).forEach(item => {
      const row = document.createElement('tr');
      const qtd = parseInt(item.Quantidade) || 0;
      const statusClass = qtd < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
      
      row.innerHTML = `
        <td class="px-4 py-2">${item.Nome || '-'}</td>
        <td class="px-4 py-2">${item.Categoria || '-'}</td>
        <td class="px-4 py-2"><span class="badge ${statusClass}">${qtd}</span></td>
        <td class="px-4 py-2">${OdontoSysAPI.formatarMoeda(item.ValorUnitario || 0)}</td>
        <td class="px-4 py-2">${item.Fornecedor || '-'}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // ==================== Utilidades ====================
  function atualizarStatusAPI(conectado) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const badge = document.getElementById('api-status-badge');
    
    if (badge) badge.style.display = conectado ? 'flex' : 'none';
    
    if (conectado) {
      if (statusDot) statusDot.classList.remove('bg-amber-400', 'animate-pulse');
      if (statusDot) statusDot.classList.add('bg-green-500');
      if (statusText) statusText.textContent = 'API Conectada';
    } else {
      if (statusDot) statusDot.classList.add('bg-red-500');
      if (statusText) statusText.textContent = 'Erro na Conexão';
    }
  }

  function abrirPaciente(id) {
    alert('Abrir prontuário do paciente: ' + id);
    // TODO: Implementar modal com detalhes do paciente
  }

  // ==================== Atualizar dados a cada 5 minutos ====================
  setInterval(carregarDados, 5 * 60 * 1000);
</script>

<!-- ==================== End OdontoSys Integration ==================== -->
```

---

## 🎯 Elementos HTML que você precisa ter no index.html

### Dashboard (IDs obrigatórios)
```html
<div id="total-pacientes">0</div>
<div id="agendamentos-hoje">0</div>
<div id="total-receber">R$ 0,00</div>
<div id="total-recebido">R$ 0,00</div>
<div id="items-baixo-estoque">0</div>
<div id="api-status-badge" style="display: none;">
  <span id="status-dot"></span>
  <span id="status-text"></span>
</div>
```

### Tabelas
```html
<!-- Tabela de Pacientes -->
<table id="tabela-pacientes">
  <thead>
    <tr>
      <th>Nome</th>
      <th>CPF</th>
      <th>Telefone</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<!-- Tabela de Agendamentos -->
<table id="tabela-agendamentos">
  <thead>
    <tr>
      <th>Data</th>
      <th>Hora</th>
      <th>Procedimento</th>
      <th>Dentista</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<!-- Tabela de Financeiro -->
<table id="tabela-financeiro">
  <thead>
    <tr>
      <th>Descrição</th>
      <th>Valor</th>
      <th>Data</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<!-- Tabela de Estoque -->
<table id="tabela-estoque">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Categoria</th>
      <th>Quantidade</th>
      <th>Valor Unitário</th>
      <th>Fornecedor</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>
```

### Formulário de Novo Paciente
```html
<form id="formNovoPaciente" onsubmit="event.preventDefault(); adicionarNovoPaciente();">
  <input type="text" id="input-nome-paciente" placeholder="Nome completo" required>
  <input type="email" id="input-email-paciente" placeholder="Email" required>
  <input type="tel" id="input-telefone-paciente" placeholder="(11) 99999-9999">
  <input type="text" id="input-cpf-paciente" placeholder="123.456.789-00">
  <button type="submit">Adicionar Paciente</button>
</form>
```

---

## ⚙️ Próximos Passos

1. **Encontre a URL do seu Deploy** no Google Apps Script
2. **Copie e cole** a URL no lugar de `SEU_DEPLOYMENT_ID_AQUI`
3. **Teste** refrescando a página no navegador
4. **Verifique** o console (F12) para mensagens de erro

---

## 🔍 Debug

Se algo não funciona:

1. Abra o **Console (F12)**
2. Procure por erros em vermelho
3. Verifique se `DEPLOYMENT_ID` está correto
4. Teste se `api` foi inicializado: `console.log(api)`
5. Teste uma chamada: `api.listarPacientes()`

---

## ✅ Pronto!

Seu dashboard agora está conectado ao backend! 🎉
