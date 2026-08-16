/**
 * OdontoSys Frontend API Client
 * Cliente JavaScript para consumir a API do Google Apps Script
 */

class OdontoSysAPI {
  constructor(deploymentIdOrUrl) {
    // Aceita a URL completa do deployment ou apenas o ID
    if (String(deploymentIdOrUrl).startsWith('http')) {
      this.apiUrl = deploymentIdOrUrl;
    } else {
      this.apiUrl = `https://script.google.com/macros/s/${deploymentIdOrUrl}/exec`;
    }
    this.timeout = 10000; // 10 segundos
  }

  /**
   * Requisição GET
   */
  async get(action, params = {}) {
    try {
      const queryString = new URLSearchParams({ action, ...params });
      const url = `${this.apiUrl}?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição GET (${action}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Requisição POST
   */
  async post(action, data = {}) {
    try {
      const payload = JSON.stringify({ action, ...data });
      
      // Sem header Content-Type: o Apps Script não aceita "preflight" CORS,
      // então o corpo vai como text/plain e o backend faz o JSON.parse
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: payload
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição POST (${action}):`, error);
      return { success: false, error: error.message };
    }
  }

  // ==================== PACIENTES ====================

  async listarPacientes() {
    return this.get('getPacientes');
  }

  async obterPaciente(id) {
    return this.get('getPaciente', { id });
  }

  async adicionarPaciente(paciente) {
    return this.post('addPaciente', paciente);
  }

  async atualizarPaciente(id, paciente) {
    return this.post('updatePaciente', { id, ...paciente });
  }

  async deletarPaciente(id) {
    return this.post('deletePaciente', { id });
  }

  // ==================== AGENDAMENTOS ====================

  async listarAgendamentos() {
    return this.get('getAgendamentos');
  }

  async adicionarAgendamento(agendamento) {
    return this.post('addAgendamento', agendamento);
  }

  async atualizarAgendamento(id, agendamento) {
    return this.post('updateAgendamento', { id, ...agendamento });
  }

  async deletarAgendamento(id) {
    return this.post('deleteAgendamento', { id });
  }

  // ==================== FINANCEIRO ====================

  async obterFinanceiro() {
    return this.get('getFinanceiro');
  }

  async adicionarRegistroFinanceiro(registro) {
    return this.post('addFinanceiro', registro);
  }

  async atualizarRegistroFinanceiro(id, registro) {
    return this.post('updateFinanceiro', { id, ...registro });
  }

  // ==================== ESTOQUE ====================

  async obterEstoque() {
    return this.get('getEstoque');
  }

  async adicionarItemEstoque(item) {
    return this.post('addEstoque', item);
  }

  async atualizarItemEstoque(id, item) {
    return this.post('updateEstoque', { id, ...item });
  }

  // ==================== PRONTUÁRIO ====================

  async obterProntuario(pacienteId) {
    return this.get('getProntuario', { pacienteId });
  }

  async adicionarAnotacaoProntuario(anotacao) {
    return this.post('addProntuario', anotacao);
  }

  // ==================== DASHBOARD ====================

  async obterDashboard() {
    return this.get('getDashboard');
  }

  // ==================== UTILIDADES ====================

  /**
   * Testar conexão com a API
   */
  async testarConexao() {
    try {
      const resultado = await this.get('getDashboard');
      return resultado.success === true;
    } catch {
      return false;
    }
  }

  /**
   * Formatar moeda em Real (R$)
   */
  static formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formatar data no padrão brasileiro
   */
  static formatarData(data) {
    if (!data) return '-';
    
    // Se já está em formato DD/MM/YYYY, retorna
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }
    
    // Converter de YYYY-MM-DD ou Date object
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Validar CPF
   */
  static validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  }

  /**
   * Validar Email
   */
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar Telefone
   */
  static validarTelefone(telefone) {
    const regex = /^\(?[0-9]{2}\)?\s?[9]?[0-9]{4}-?[0-9]{4}$/;
    return regex.test(telefone);
  }

  /**
   * Máscara de CPF
   */
  static mascaraCPF(cpf) {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Máscara de Telefone
   */
  static mascaraTelefone(telefone) {
    return telefone.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  }

  /**
   * Máscara de CEP
   */
  static mascaraCEP(cep) {
    return cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

/**
 * Funções auxiliares para integração no HTML
 */

// Inicializar API global
let api = null;

/**
 * Inicializar a API (chamar isso uma vez no load da página)
 */
function inicializarAPI(deploymentId) {
  api = new OdontoSysAPI(deploymentId);
  console.log('✅ API OdontoSys inicializada');
}

// Export para usar em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OdontoSysAPI;
}
