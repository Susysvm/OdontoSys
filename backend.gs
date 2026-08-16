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
const SHEET_PRONTUARIO = "Prontuario_Evolucao";
const SHEET_USUARIOS = "Usuarios";

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
 * Deletar linha na planilha (remoção física — mantido como utilitário
 * genérico; os handlers de negócio usam soft delete via updateRow)
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

/**
 * Data de hoje no formato dd/mm/aaaa (fuso America/Manaus)
 */
function hojeBR() {
  return Utilities.formatDate(new Date(), "America/Manaus", "dd/MM/yyyy");
}

/**
 * Normaliza uma célula de data (objeto Date do Sheets ou texto) para "dd/mm/aaaa"
 */
function formatDataBR(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, "America/Manaus", "dd/MM/yyyy");
  }
  return v === undefined || v === null ? "" : String(v);
}

/**
 * Parser de valores monetários pt-BR: aceita número ou texto
 * ("R$ 1.234,56" / "350,00") e retorna Number.
 */
function parseValorBR(v) {
  if (v === "" || v === null || v === undefined) return 0;
  if (typeof v === "number") return v;

  let texto = String(v).trim();
  texto = texto.replace(/^R\$\s*/, "");
  texto = texto.replace(/\./g, ""); // remove separador de milhar
  texto = texto.replace(",", "."); // vírgula decimal -> ponto

  const n = parseFloat(texto);
  return isNaN(n) ? 0 : n;
}

/**
 * Formata um número como moeda pt-BR: 350.5 -> "R$ 350,50"
 */
function formatMoedaBR(numero) {
  const negativo = numero < 0;
  const abs = Math.abs(numero);
  const partes = abs.toFixed(2).split(".");
  const inteiroComSeparador = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resultado = "R$ " + inteiroComSeparador + "," + partes[1];
  return negativo ? "-" + resultado : resultado;
}

/**
 * Valor a gravar na planilha: número vira texto "R$ X,XX" (pt-BR);
 * string é gravada como veio.
 */
function valorParaGravar(v) {
  if (typeof v === "number") return formatMoedaBR(v);
  if (v === undefined || v === null) return "";
  return v;
}

/**
 * Arredonda para 2 casas decimais evitando erro de ponto flutuante
 */
function arredondar2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
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
      case "getUsuarios":
        response = handleGetUsuarios();
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
  const paciente = pacientes.find(p => String(p.id) === String(id));

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

function handleUpdatePaciente(data) {
  const campos = {};
  if (data.nome !== undefined) campos.nome_completo = data.nome;
  if (data.cpf !== undefined) campos.cpf = data.cpf;
  if (data.email !== undefined) campos.email = data.email;
  if (data.telefone !== undefined) campos.celular = data.telefone;
  if (data.dataNascimento !== undefined) campos.data_nascimento = data.dataNascimento;
  if (data.endereco !== undefined) campos.endereco_completo = data.endereco;
  if (data.statusLgpd !== undefined) campos.status_lgpd = data.statusLgpd;
  if (data.ativo !== undefined) campos.ativo = data.ativo;

  return updateRow(SHEET_PACIENTES, data.id, campos);
}

function handleDeletePaciente(id) {
  return updateRow(SHEET_PACIENTES, id, { ativo: false });
}

// ==================== HANDLERS - USUÁRIOS ====================

function handleGetUsuarios() {
  const usuarios = sheetToJson(SHEET_USUARIOS);
  const ativos = usuarios.filter(u => u.ativo === true);
  return { success: true, data: ativos };
}

// ==================== HANDLERS - AGENDAMENTOS ====================

function handleGetAgendamentos() {
  const agendamentos = sheetToJson(SHEET_AGENDAMENTOS);
  return { success: true, data: agendamentos };
}

function handleAddAgendamento(data) {
  const agendamento = {
    id: proximoIdNumerico(SHEET_AGENDAMENTOS),
    paciente_id: data.pacienteId || "",
    dentista_id: data.dentistaId || "",
    categoria: data.categoria || "",
    procedimento: data.procedimento || "",
    data_consulta: data.data || "",
    horario_consulta: data.hora || "",
    valor: valorParaGravar(data.valor),
    status: data.status || "Agendado",
    ativo: true
  };

  return addRow(SHEET_AGENDAMENTOS, agendamento);
}

function handleUpdateAgendamento(data) {
  const campos = {};
  if (data.pacienteId !== undefined) campos.paciente_id = data.pacienteId;
  if (data.dentistaId !== undefined) campos.dentista_id = data.dentistaId;
  if (data.categoria !== undefined) campos.categoria = data.categoria;
  if (data.procedimento !== undefined) campos.procedimento = data.procedimento;
  if (data.data !== undefined) campos.data_consulta = data.data;
  if (data.hora !== undefined) campos.horario_consulta = data.hora;
  if (data.valor !== undefined) campos.valor = valorParaGravar(data.valor);
  if (data.status !== undefined) campos.status = data.status;

  return updateRow(SHEET_AGENDAMENTOS, data.id, campos);
}

function handleDeleteAgendamento(id) {
  return updateRow(SHEET_AGENDAMENTOS, id, { ativo: false });
}

// ==================== HANDLERS - FINANCEIRO ====================

function handleGetFinanceiro() {
  const financeiro = sheetToJson(SHEET_FINANCEIRO);

  let totalReceber = 0;
  let totalRecebido = 0;

  financeiro.forEach(item => {
    if (item.ativo === false) return;
    if (item.tipo_movimentacao !== "Receita") return;

    const valor = parseValorBR(item.valor_total);
    if (item.status_pagamento === "Recebido" || item.status_pagamento === "Pago") {
      totalRecebido += valor;
    } else {
      totalReceber += valor;
    }
  });

  return {
    success: true,
    data: financeiro,
    resumo: {
      totalReceber: arredondar2(totalReceber),
      totalRecebido: arredondar2(totalRecebido)
    }
  };
}

function handleAddFinanceiro(data) {
  const financeiro = {
    id: proximoIdNumerico(SHEET_FINANCEIRO),
    paciente_id: data.pacienteId || "",
    tipo_movimentacao: data.tipo || "Receita",
    descricao: data.descricao || "",
    data_vencimento: data.dataVencimento || "",
    valor_total: valorParaGravar(data.valor),
    forma_pagamento: data.formaPagamento || "",
    status_pagamento: data.status || "Pendente",
    nota_fiscal_url: data.notaFiscalUrl || "",
    ativo: true
  };

  return addRow(SHEET_FINANCEIRO, financeiro);
}

function handleUpdateFinanceiro(data) {
  const campos = {};
  if (data.pacienteId !== undefined) campos.paciente_id = data.pacienteId;
  if (data.tipo !== undefined) campos.tipo_movimentacao = data.tipo;
  if (data.descricao !== undefined) campos.descricao = data.descricao;
  if (data.dataVencimento !== undefined) campos.data_vencimento = data.dataVencimento;
  if (data.valor !== undefined) campos.valor_total = valorParaGravar(data.valor);
  if (data.formaPagamento !== undefined) campos.forma_pagamento = data.formaPagamento;
  if (data.status !== undefined) campos.status_pagamento = data.status;
  if (data.notaFiscalUrl !== undefined) campos.nota_fiscal_url = data.notaFiscalUrl;

  return updateRow(SHEET_FINANCEIRO, data.id, campos);
}

// ==================== HANDLERS - ESTOQUE ====================

function handleGetEstoque() {
  const estoque = sheetToJson(SHEET_ESTOQUE);
  return { success: true, data: estoque };
}

function handleAddEstoque(data) {
  const item = {
    id: proximoIdNumerico(SHEET_ESTOQUE),
    nome_produto: data.nome || "",
    categoria_produto: data.categoria || "",
    quantidade_atual: data.quantidade !== undefined ? data.quantidade : 0,
    estoque_minimo: data.estoqueMinimo !== undefined ? data.estoqueMinimo : 0,
    data_validade: data.validade || "",
    lote: data.lote || "",
    ativo: true
  };

  return addRow(SHEET_ESTOQUE, item);
}

function handleUpdateEstoque(data) {
  const campos = {};
  if (data.nome !== undefined) campos.nome_produto = data.nome;
  if (data.categoria !== undefined) campos.categoria_produto = data.categoria;
  if (data.quantidade !== undefined) campos.quantidade_atual = data.quantidade;
  if (data.estoqueMinimo !== undefined) campos.estoque_minimo = data.estoqueMinimo;
  if (data.validade !== undefined) campos.data_validade = data.validade;
  if (data.lote !== undefined) campos.lote = data.lote;
  if (data.ativo !== undefined) campos.ativo = data.ativo;

  return updateRow(SHEET_ESTOQUE, data.id, campos);
}

// ==================== HANDLERS - PRONTUÁRIO ====================

function handleGetProntuario(pacienteId) {
  const prontuarios = sheetToJson(SHEET_PRONTUARIO);
  const pacienteProntuarios = prontuarios.filter(p => String(p.paciente_id) === String(pacienteId));

  return { success: true, data: pacienteProntuarios };
}

function handleAddProntuario(data) {
  const prontuario = {
    id: proximoIdNumerico(SHEET_PRONTUARIO),
    paciente_id: data.pacienteId || "",
    dentista_id: data.dentistaId || "",
    data_registro: hojeBR(),
    anamnese_alertas: data.anamnese || "",
    evolucao_texto: data.evolucao || "",
    assinatura_digital_hash: "",
    ativo: true
  };

  return addRow(SHEET_PRONTUARIO, prontuario);
}

// ==================== HANDLERS - DASHBOARD ====================

function handleGetDashboard() {
  const pacientes = sheetToJson(SHEET_PACIENTES);
  const agendamentos = sheetToJson(SHEET_AGENDAMENTOS);
  const financeiro = sheetToJson(SHEET_FINANCEIRO);
  const estoque = sheetToJson(SHEET_ESTOQUE);

  // Total de pacientes ativos
  const totalPacientes = pacientes.filter(p => p.ativo === true).length;

  // Agendamentos de hoje (compara data normalizada dd/mm/aaaa)
  const hoje = hojeBR();
  const agendamentosHoje = agendamentos.filter(a =>
    a.ativo === true && formatDataBR(a.data_consulta) === hoje
  ).length;

  // Resumo financeiro (só Receita, ignora inativos)
  let totalReceber = 0;
  let totalRecebido = 0;

  financeiro.forEach(item => {
    if (item.ativo === false) return;
    if (item.tipo_movimentacao !== "Receita") return;

    const valor = parseValorBR(item.valor_total);
    if (item.status_pagamento === "Recebido" || item.status_pagamento === "Pago") {
      totalRecebido += valor;
    } else {
      totalReceber += valor;
    }
  });

  // Itens com estoque no mínimo ou abaixo
  const itensBaixoEstoque = estoque.filter(i =>
    i.ativo === true && Number(i.quantidade_atual) <= Number(i.estoque_minimo)
  ).length;

  return {
    success: true,
    resumo: {
      totalPacientes: totalPacientes,
      agendamentosHoje: agendamentosHoje,
      totalReceber: arredondar2(totalReceber),
      totalRecebido: arredondar2(totalRecebido),
      itensBaixoEstoque: itensBaixoEstoque
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
