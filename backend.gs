/**
 * OdontoSys Backend - Google Apps Script
 * Sistema integrado de gerenciamento para consultório odontológico
 * Database: Google Sheets (1unY03s9nU0G08R5-VROV1Ebdxi9v7qT6myqNGkwahpE)
 */

// ==================== CONFIGURAÇÕES ====================
const SPREADSHEET_ID = "1unY03s9nU0G08R5-VROV1Ebdxi9v7qT6myqNGkwahpE";
const SHEET_PACIENTES = "Pacientes";
const SHEET_AGENDAMENTOS = "Agendamentos";
const SHEET_FINANCEIRO = "Financeiro";
const SHEET_ESTOQUE = "Estoque";
const SHEET_PRONTUARIO = "Prontuário";
const SHEET_USUARIOS = "Usuários";

// ==================== UTILS & HELPERS ====================

/**
 * Obter objeto da planilha
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Obter uma aba específica
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}

/**
 * Linha "vazia de verdade": só células em branco ou checkbox desmarcado.
 * (Colunas de checkbox preenchem a grade inteira com FALSE, então não
 * dá para confiar só no getDataRange.)
 */
function isRowEmpty(row) {
  return row.every(function (cell) { return cell === "" || cell === false; });
}

/**
 * Converter dados da planilha em JSON
 */
function sheetToJson(sheetName) {
  const sheet = getSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length === 0) return [];

  const headers = values[0];
  const data = [];

  for (let i = 1; i < values.length; i++) {
    if (isRowEmpty(values[i])) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }

  return data;
}

/**
 * Adicionar linha na planilha
 */
function addRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  const keys = Object.keys(data);

  if (values.length === 0 || isRowEmpty(values[0])) {
    // Planilha vazia: criar header e gravar a primeira linha
    sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    sheet.getRange(2, 1, 1, keys.length).setValues([keys.map(function (k) { return data[k]; })]);
    return { success: true, message: "Registro adicionado com sucesso" };
  }

  const headers = values[0];
  const row = headers.map(function (h) {
    return data[h] !== undefined ? data[h] : "";
  });

  // Achar a última linha com conteúdo de verdade (appendRow se perde
  // quando uma coluna de checkbox preenche a grade toda com FALSE)
  let lastRow = 1;
  for (let i = 1; i < values.length; i++) {
    if (!isRowEmpty(values[i])) lastRow = i + 1;
  }

  sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
  return { success: true, message: "Registro adicionado com sucesso" };
}

/**
 * Atualizar linha na planilha
 */
function updateRow(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return { success: false, error: "Nenhum dado encontrado" };
  }
  
  const headers = values[0];
  let idIndex = headers.indexOf("ID");
  if (idIndex === -1) idIndex = headers.indexOf("id");

  if (idIndex === -1) {
    return { success: false, error: "Coluna ID não encontrada" };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      for (let j = 0; j < headers.length; j++) {
        if (data[headers[j]] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(data[headers[j]]);
        }
      }
      return { success: true, message: "Registro atualizado com sucesso" };
    }
  }
  
  return { success: false, error: "Registro não encontrado" };
}

/**
 * Deletar linha na planilha
 */
function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return { success: false, error: "Nenhum dado encontrado" };
  }
  
  const headers = values[0];
  let idIndex = headers.indexOf("ID");
  if (idIndex === -1) idIndex = headers.indexOf("id");

  if (idIndex === -1) {
    return { success: false, error: "Coluna ID não encontrada" };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Registro deletado com sucesso" };
    }
  }
  
  return { success: false, error: "Registro não encontrado" };
}

/**
 * Gerar ID único
 */
function generateId() {
  return "ID_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 9);
}

// ==================== ENDPOINTS HTTP ====================

/**
 * Tratador principal para requisições GET
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "";
    const params = e.parameter;
    
    let response;
    
    switch (action) {
      case "getPacientes":
        response = handleGetPacientes();
        break;
      case "getPaciente":
        response = handleGetPaciente(params.id);
        break;
      case "getAgendamentos":
        response = handleGetAgendamentos();
        break;
      case "getFinanceiro":
        response = handleGetFinanceiro();
        break;
      case "getEstoque":
        response = handleGetEstoque();
        break;
      case "getProntuario":
        response = handleGetProntuario(params.pacienteId);
        break;
      case "getDashboard":
        response = handleGetDashboard();
        break;
      default:
        response = { success: false, error: "Ação não reconhecida" };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Tratador principal para requisições POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "";
    
    let response;
    
    switch (action) {
      case "addPaciente":
        response = handleAddPaciente(data);
        break;
      case "updatePaciente":
        response = handleUpdatePaciente(data);
        break;
      case "deletePaciente":
        response = handleDeletePaciente(data.id);
        break;
      case "addAgendamento":
        response = handleAddAgendamento(data);
        break;
      case "updateAgendamento":
        response = handleUpdateAgendamento(data);
        break;
      case "deleteAgendamento":
        response = handleDeleteAgendamento(data.id);
        break;
      case "addFinanceiro":
        response = handleAddFinanceiro(data);
        break;
      case "updateFinanceiro":
        response = handleUpdateFinanceiro(data);
        break;
      case "addEstoque":
        response = handleAddEstoque(data);
        break;
      case "updateEstoque":
        response = handleUpdateEstoque(data);
        break;
      case "addProntuario":
        response = handleAddProntuario(data);
        break;
      case "updateProntuario":
        response = handleUpdateProntuario(data);
        break;
      default:
        response = { success: false, error: "Ação não reconhecida" };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== HANDLERS - PACIENTES ====================

function handleGetPacientes() {
  const pacientes = sheetToJson(SHEET_PACIENTES);
  return { success: true, data: pacientes };
}

function handleGetPaciente(id) {
  const pacientes = sheetToJson(SHEET_PACIENTES);
  const paciente = pacientes.find(p => String(p.ID !== undefined ? p.ID : p.id) === String(id));
  
  if (!paciente) {
    return { success: false, error: "Paciente não encontrado" };
  }
  
  return { success: true, data: paciente };
}

function handleAddPaciente(data) {
  // Colunas reais da aba "Pacientes" na planilha:
  // id | nome_completo | cpf | data_nascimento | celular | email |
  // endereco_completo | foto_url | status_lgpd | ativo
  const enderecoCompleto = [
    data.endereco,
    data.cidade,
    data.estado,
    data.cep ? "CEP " + data.cep : ""
  ].filter(function (x) { return x; }).join(", ");

  const paciente = {
    id: proximoIdNumerico(SHEET_PACIENTES),
    nome_completo: data.nome || "",
    cpf: data.cpf || "",
    data_nascimento: data.dataNascimento || "",
    celular: data.telefone || "",
    email: data.email || "",
    endereco_completo: enderecoCompleto,
    foto_url: "",
    status_lgpd: "Pendente",
    ativo: true
  };

  return addRow(SHEET_PACIENTES, paciente);
}

/**
 * Próximo id numérico sequencial (coluna "id") de uma aba
 */
function proximoIdNumerico(sheetName) {
  const registros = sheetToJson(sheetName);
  let maior = 0;
  registros.forEach(function (r) {
    const n = parseInt(r.id, 10);
    if (!isNaN(n) && n > maior) maior = n;
  });
  return maior + 1;
}

function handleUpdatePaciente(data) {
  return updateRow(SHEET_PACIENTES, data.id, {
    Nome: data.nome,
    CPF: data.cpf,
    Email: data.email,
    Telefone: data.telefone,
    DataNascimento: data.dataNascimento,
    Endereço: data.endereco,
    Cidade: data.cidade,
    Estado: data.estado,
    CEP: data.cep,
    Status: data.status,
    Obs: data.obs
  });
}

function handleDeletePaciente(id) {
  return deleteRow(SHEET_PACIENTES, id);
}

// ==================== HANDLERS - AGENDAMENTOS ====================

function handleGetAgendamentos() {
  const agendamentos = sheetToJson(SHEET_AGENDAMENTOS);
  return { success: true, data: agendamentos };
}

function handleAddAgendamento(data) {
  const agendamento = {
    ID: generateId(),
    PacienteID: data.pacienteId || "",
    Data: data.data || "",
    Hora: data.hora || "",
    Procedimento: data.procedimento || "",
    Dentista: data.dentista || "",
    Status: data.status || "Agendado",
    Obs: data.obs || "",
    DataCriacao: new Date().toLocaleDateString("pt-BR")
  };
  
  return addRow(SHEET_AGENDAMENTOS, agendamento);
}

function handleUpdateAgendamento(data) {
  return updateRow(SHEET_AGENDAMENTOS, data.id, {
    PacienteID: data.pacienteId,
    Data: data.data,
    Hora: data.hora,
    Procedimento: data.procedimento,
    Dentista: data.dentista,
    Status: data.status,
    Obs: data.obs
  });
}

function handleDeleteAgendamento(id) {
  return deleteRow(SHEET_AGENDAMENTOS, id);
}

// ==================== HANDLERS - FINANCEIRO ====================

function handleGetFinanceiro() {
  const financeiro = sheetToJson(SHEET_FINANCEIRO);
  
  let totalReceber = 0;
  let totalRecebido = 0;
  
  financeiro.forEach(item => {
    const valor = parseFloat(item.Valor) || 0;
    if (item.Status === "Pago") {
      totalRecebido += valor;
    } else {
      totalReceber += valor;
    }
  });
  
  return {
    success: true,
    data: financeiro,
    resumo: {
      totalReceber: totalReceber.toFixed(2),
      totalRecebido: totalRecebido.toFixed(2)
    }
  };
}

function handleAddFinanceiro(data) {
  const financeiro = {
    ID: generateId(),
    PacienteID: data.pacienteId || "",
    Descricao: data.descricao || "",
    Valor: data.valor || 0,
    Data: data.data || new Date().toLocaleDateString("pt-BR"),
    Status: data.status || "Pendente",
    Tipo: data.tipo || "Receita",
    FormaPagamento: data.formaPagamento || "",
    Obs: data.obs || ""
  };
  
  return addRow(SHEET_FINANCEIRO, financeiro);
}

function handleUpdateFinanceiro(data) {
  return updateRow(SHEET_FINANCEIRO, data.id, {
    PacienteID: data.pacienteId,
    Descricao: data.descricao,
    Valor: data.valor,
    Data: data.data,
    Status: data.status,
    Tipo: data.tipo,
    FormaPagamento: data.formaPagamento,
    Obs: data.obs
  });
}

// ==================== HANDLERS - ESTOQUE ====================

function handleGetEstoque() {
  const estoque = sheetToJson(SHEET_ESTOQUE);
  return { success: true, data: estoque };
}

function handleAddEstoque(data) {
  const item = {
    ID: generateId(),
    Nome: data.nome || "",
    Categoria: data.categoria || "",
    Quantidade: data.quantidade || 0,
    Unidade: data.unidade || "",
    ValorUnitario: data.valorUnitario || 0,
    Fornecedor: data.fornecedor || "",
    DataEntrada: new Date().toLocaleDateString("pt-BR"),
    ValidadeMeses: data.validadeMeses || "",
    Obs: data.obs || ""
  };
  
  return addRow(SHEET_ESTOQUE, item);
}

function handleUpdateEstoque(data) {
  return updateRow(SHEET_ESTOQUE, data.id, {
    Nome: data.nome,
    Categoria: data.categoria,
    Quantidade: data.quantidade,
    Unidade: data.unidade,
    ValorUnitario: data.valorUnitario,
    Fornecedor: data.fornecedor,
    ValidadeMeses: data.validadeMeses,
    Obs: data.obs
  });
}

// ==================== HANDLERS - PRONTUÁRIO ====================

function handleGetProntuario(pacienteId) {
  const prontuarios = sheetToJson(SHEET_PRONTUARIO);
  const pacienteProntuarios = prontuarios.filter(p => p.PacienteID === pacienteId);
  
  return { success: true, data: pacienteProntuarios };
}

function handleAddProntuario(data) {
  const prontuario = {
    ID: generateId(),
    PacienteID: data.pacienteId || "",
    Data: new Date().toLocaleDateString("pt-BR"),
    Hora: new Date().toLocaleTimeString("pt-BR"),
    Dentista: data.dentista || "",
    Queixa: data.queixa || "",
    Diagnostico: data.diagnostico || "",
    Tratamento: data.tratamento || "",
    Medicacao: data.medicacao || "",
    Evolucao: data.evolucao || "",
    Proxima: data.proxima || "",
    Obs: data.obs || ""
  };
  
  return addRow(SHEET_PRONTUARIO, prontuario);
}

function handleUpdateProntuario(data) {
  return updateRow(SHEET_PRONTUARIO, data.id, {
    PacienteID: data.pacienteId,
    Dentista: data.dentista,
    Queixa: data.queixa,
    Diagnostico: data.diagnostico,
    Tratamento: data.tratamento,
    Medicacao: data.medicacao,
    Evolucao: data.evolucao,
    Proxima: data.proxima,
    Obs: data.obs
  });
}

// ==================== HANDLERS - DASHBOARD ====================

function handleGetDashboard() {
  const pacientes = sheetToJson(SHEET_PACIENTES);
  const agendamentos = sheetToJson(SHEET_AGENDAMENTOS);
  const financeiro = sheetToJson(SHEET_FINANCEIRO);
  const estoque = sheetToJson(SHEET_ESTOQUE);
  
  // Cálculos
  const totalPacientes = pacientes.length;
  const agendamentosHoje = agendamentos.filter(a => a.Data === new Date().toLocaleDateString("pt-BR")).length;
  
  let totalReceber = 0;
  let totalRecebido = 0;
  
  financeiro.forEach(item => {
    const valor = parseFloat(item.Valor) || 0;
    if (item.Status === "Pago") {
      totalRecebido += valor;
    } else {
      totalReceber += valor;
    }
  });
  
  // Itens com baixo estoque
  const itensBaixoEstoque = estoque.filter(i => parseInt(i.Quantidade) < 10);
  
  return {
    success: true,
    resumo: {
      totalPacientes: totalPacientes,
      agendamentosHoje: agendamentosHoje,
      totalReceber: totalReceber.toFixed(2),
      totalRecebido: totalRecebido.toFixed(2),
      itensBaixoEstoque: itensBaixoEstoque.length
    }
  };
}

// ==================== TESTE ====================

/**
 * Função de teste para verificar se a API está funcionando
 */
function testarAPI() {
  Logger.log("=== Teste API OdontoSys ===");
  Logger.log("Spreadsheet ID: " + SPREADSHEET_ID);
  
  try {
    const ss = getSpreadsheet();
    Logger.log("✓ Conexão com Spreadsheet: OK");
    Logger.log("✓ Nome: " + ss.getName());
  } catch (e) {
    Logger.log("✗ Erro: " + e.toString());
  }
  
  // Testar leitura de pacientes
  try {
    const pacientes = sheetToJson(SHEET_PACIENTES);
    Logger.log("✓ Pacientes lidos: " + pacientes.length);
  } catch (e) {
    Logger.log("✗ Erro ao ler pacientes: " + e.toString());
  }
  
  Logger.log("=== Fim do Teste ===");
}
