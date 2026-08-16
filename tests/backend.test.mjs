// Testes do backend.gs (Google Apps Script) rodados em Node com mocks de
// SpreadsheetApp / ContentService / Utilities / Logger.
//
// Rodar com: node --test tests/backend.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_PATH = path.join(__dirname, "..", "backend.gs");
const BACKEND_CODE = readFileSync(BACKEND_PATH, "utf8");

// ==================== FIXTURES (cabeçalhos exatos do contrato) ====================

function fixturesBase() {
  return {
    Pacientes: [
      ["id", "nome_completo", "cpf", "data_nascimento", "celular", "email", "endereco_completo", "foto_url", "status_lgpd", "ativo"],
      [1, "Maria Silva", "111.111.111-11", "01/01/1990", "92999990000", "maria@x.com", "Rua A, 1", "", "Pendente", true],
      [2, "João Souza", "222.222.222-22", "02/02/1985", "92999990001", "joao@x.com", "Rua B, 2", "", "Aprovado", true],
      [3, "Ana Costa", "333.333.333-33", "03/03/1995", "92999990002", "ana@x.com", "Rua C, 3", "", "Pendente", false],
      ["", "", "", "", "", "", "", "", "", false],
      ["", "", "", "", "", "", "", "", "", false]
    ],
    Usuarios: [
      ["id", "nome", "perfil_acesso", "cro", "email_login", "foto_url", "ativo"],
      [1, "Dr. Pedro", "Dentista", "CRO-123", "pedro@x.com", "", true],
      [2, "Recepção Ana", "Recepcao", "", "ana.r@x.com", "", true],
      [3, "Ex Funcionario", "Dentista", "CRO-999", "ex@x.com", "", false],
      ["", "", "", "", "", "", false]
    ],
    Agendamentos: [
      ["id", "paciente_id", "dentista_id", "categoria", "procedimento", "data_consulta", "horario_consulta", "valor", "status", "ativo"],
      [1, 1, 1, "Consulta", "Avaliação", "15/08/2026", "09:00", "R$ 150,00", "Agendado", true],
      [2, 2, 1, "Consulta", "Limpeza", "20/08/2026", "10:00", "R$ 200,00", "Agendado", true],
      [3, 1, 1, "Retorno", "Avaliação", "15/08/2026", "11:00", "R$ 0,00", "Cancelado", false],
      ["", "", "", "", "", "", "", "", "", false]
    ],
    Financeiro: [
      ["id", "paciente_id", "tipo_movimentacao", "descricao", "data_vencimento", "valor_total", "forma_pagamento", "status_pagamento", "nota_fiscal_url", "ativo"],
      [1, 1, "Receita", "Consulta", "10/08/2026", "R$ 350,00", "Pix", "Recebido", "", true],
      [2, 2, "Receita", "Limpeza", "12/08/2026", "R$ 200,00", "Dinheiro", "Pendente", "", true],
      [3, 1, "Despesa", "Material", "05/08/2026", "R$ 80,00", "Cartão", "Pago", "", true],
      [4, 1, "Receita", "Consulta antiga", "01/08/2026", "R$ 100,00", "Pix", "Pago", "", true],
      ["", "", "", "", "", "", "", "", "", false]
    ],
    Estoque: [
      ["id", "nome_produto", "categoria_produto", "quantidade_atual", "estoque_minimo", "data_validade", "lote", "ativo"],
      [1, "Luva", "Descartável", 5, 10, "01/12/2026", "L1", true],
      [2, "Anestésico", "Medicamento", 20, 5, "01/06/2027", "L2", true],
      [3, "Algodão", "Descartável", 10, 10, "01/01/2027", "L3", true],
      [4, "Item Antigo", "X", 0, 0, "", "L4", false],
      ["", "", "", "", "", "", "", false]
    ],
    Prontuario_Evolucao: [
      ["id", "paciente_id", "dentista_id", "data_registro", "anamnese_alertas", "evolucao_texto", "assinatura_digital_hash", "ativo"],
      [1, 1, 1, "01/08/2026", "Nenhum", "Avaliação inicial", "", true],
      [2, 2, 1, "05/08/2026", "Alergia a penicilina", "Limpeza realizada", "", true],
      ["", "", "", "", "", "", "", false]
    ]
  };
}

// ==================== MOCKS ====================

class FakeRange {
  constructor(sheet, row, col, numRows, numCols) {
    this.sheet = sheet;
    this.row = row;
    this.col = col;
    this.numRows = numRows;
    this.numCols = numCols;
  }

  getValues() {
    const out = [];
    for (let i = 0; i < this.numRows; i++) {
      const rIdx = this.row - 1 + i;
      const rowData = this.sheet.data[rIdx] || [];
      const rowOut = [];
      for (let j = 0; j < this.numCols; j++) {
        const v = rowData[this.col - 1 + j];
        rowOut.push(v === undefined ? "" : v);
      }
      out.push(rowOut);
    }
    return out;
  }

  setValues(values) {
    for (let i = 0; i < values.length; i++) {
      const rIdx = this.row - 1 + i;
      while (this.sheet.data.length <= rIdx) this.sheet.data.push([]);
      const rowArr = this.sheet.data[rIdx];
      for (let j = 0; j < values[i].length; j++) {
        rowArr[this.col - 1 + j] = values[i][j];
      }
    }
    return this;
  }

  setValue(v) {
    return this.setValues([[v]]);
  }
}

class FakeSheet {
  constructor(name, rows) {
    this.name = name;
    this.data = rows.map((r) => r.slice());
  }

  getDataRange() {
    const numCols = this.data.reduce((max, r) => Math.max(max, r.length), 0);
    return new FakeRange(this, 1, 1, this.data.length, numCols);
  }

  getRange(row, col, numRows, numCols) {
    return new FakeRange(this, row, col, numRows || 1, numCols || 1);
  }

  deleteRow(row) {
    this.data.splice(row - 1, 1);
  }
}

class FakeSpreadsheet {
  constructor(fixtures) {
    this.sheets = {};
    for (const nome in fixtures) {
      this.sheets[nome] = new FakeSheet(nome, fixtures[nome]);
    }
  }

  getSheetByName(nome) {
    return this.sheets[nome] || null;
  }

  insertSheet(nome) {
    const s = new FakeSheet(nome, [[]]);
    this.sheets[nome] = s;
    return s;
  }

  getName() {
    return "OdontoSys Fake";
  }
}

/**
 * Cria um ambiente novo (planilha fake + contexto vm com backend.gs carregado)
 * para cada teste, evitando contaminação entre casos.
 */
function criarAmbiente() {
  const spreadsheet = new FakeSpreadsheet(fixturesBase());

  const SpreadsheetApp = {
    openById() {
      return spreadsheet;
    }
  };

  const ContentService = {
    MimeType: { JSON: "JSON" },
    createTextOutput(str) {
      const output = {
        _content: str,
        setMimeType() {
          return output;
        },
        getContent() {
          return output._content;
        }
      };
      return output;
    }
  };

  const Utilities = {
    formatDate() {
      return "15/08/2026"; // data fixa simulando "hoje"
    }
  };

  const Logger = {
    log() {}
  };

  const sandbox = { SpreadsheetApp, ContentService, Utilities, Logger, console };
  vm.createContext(sandbox);
  vm.runInContext(BACKEND_CODE, sandbox, { filename: "backend.gs" });

  return { sandbox, spreadsheet };
}

function chamarGet(sandbox, parametros) {
  const resultado = sandbox.doGet({ parameter: parametros });
  return JSON.parse(resultado.getContent());
}

function chamarPost(sandbox, corpo) {
  const resultado = sandbox.doPost({ postData: { contents: JSON.stringify(corpo) } });
  return JSON.parse(resultado.getContent());
}

// ==================== TESTES ====================

test("addAgendamento grava linha com colunas certas e id sequencial", () => {
  const { sandbox, spreadsheet } = criarAmbiente();

  const resp = chamarPost(sandbox, {
    action: "addAgendamento",
    pacienteId: 3,
    dentistaId: 2,
    categoria: "Consulta",
    procedimento: "Extração",
    data: "16/08/2026",
    hora: "14:00",
    valor: 250,
    status: "Agendado"
  });

  assert.equal(resp.success, true);

  const dados = spreadsheet.sheets.Agendamentos.data;
  const headers = dados[0];
  const novaLinha = dados[dados.length - 1];
  const linhaObj = {};
  headers.forEach((h, i) => (linhaObj[h] = novaLinha[i]));

  assert.equal(linhaObj.id, 4); // maior id existente era 3
  assert.equal(linhaObj.paciente_id, 3);
  assert.equal(linhaObj.dentista_id, 2);
  assert.equal(linhaObj.categoria, "Consulta");
  assert.equal(linhaObj.procedimento, "Extração");
  assert.equal(linhaObj.data_consulta, "16/08/2026");
  assert.equal(linhaObj.horario_consulta, "14:00");
  assert.equal(linhaObj.valor, "R$ 250,00");
  assert.equal(linhaObj.status, "Agendado");
  assert.equal(linhaObj.ativo, true);
});

test("addFinanceiro grava linha com colunas certas e id sequencial", () => {
  const { sandbox, spreadsheet } = criarAmbiente();

  const resp = chamarPost(sandbox, {
    action: "addFinanceiro",
    pacienteId: 2,
    tipo: "Receita",
    descricao: "Clareamento",
    dataVencimento: "20/08/2026",
    valor: 480.5,
    formaPagamento: "Cartão"
  });

  assert.equal(resp.success, true);

  const dados = spreadsheet.sheets.Financeiro.data;
  const headers = dados[0];
  const novaLinha = dados[dados.length - 1];
  const linhaObj = {};
  headers.forEach((h, i) => (linhaObj[h] = novaLinha[i]));

  assert.equal(linhaObj.id, 5); // maior id existente era 4
  assert.equal(linhaObj.paciente_id, 2);
  assert.equal(linhaObj.tipo_movimentacao, "Receita");
  assert.equal(linhaObj.descricao, "Clareamento");
  assert.equal(linhaObj.data_vencimento, "20/08/2026");
  assert.equal(linhaObj.valor_total, "R$ 480,50");
  assert.equal(linhaObj.forma_pagamento, "Cartão");
  assert.equal(linhaObj.status_pagamento, "Pendente"); // padrão
  assert.equal(linhaObj.ativo, true);
});

test("addEstoque grava linha com colunas certas e id sequencial", () => {
  const { sandbox, spreadsheet } = criarAmbiente();

  const resp = chamarPost(sandbox, {
    action: "addEstoque",
    nome: "Seringa",
    categoria: "Descartável",
    quantidade: 30,
    estoqueMinimo: 10,
    validade: "01/01/2028",
    lote: "L9"
  });

  assert.equal(resp.success, true);

  const dados = spreadsheet.sheets.Estoque.data;
  const headers = dados[0];
  const novaLinha = dados[dados.length - 1];
  const linhaObj = {};
  headers.forEach((h, i) => (linhaObj[h] = novaLinha[i]));

  assert.equal(linhaObj.id, 5); // maior id existente era 4
  assert.equal(linhaObj.nome_produto, "Seringa");
  assert.equal(linhaObj.categoria_produto, "Descartável");
  assert.equal(linhaObj.quantidade_atual, 30);
  assert.equal(linhaObj.estoque_minimo, 10);
  assert.equal(linhaObj.data_validade, "01/01/2028");
  assert.equal(linhaObj.lote, "L9");
  assert.equal(linhaObj.ativo, true);
});

test("addProntuario grava em Prontuario_Evolucao com data_registro hoje", () => {
  const { sandbox, spreadsheet } = criarAmbiente();

  const resp = chamarPost(sandbox, {
    action: "addProntuario",
    pacienteId: 1,
    dentistaId: 1,
    anamnese: "Sem alergias",
    evolucao: "Restauração realizada"
  });

  assert.equal(resp.success, true);

  const dados = spreadsheet.sheets.Prontuario_Evolucao.data;
  const headers = dados[0];
  const novaLinha = dados[dados.length - 1];
  const linhaObj = {};
  headers.forEach((h, i) => (linhaObj[h] = novaLinha[i]));

  assert.equal(linhaObj.id, 3); // maior id existente era 2
  assert.equal(linhaObj.paciente_id, 1);
  assert.equal(linhaObj.dentista_id, 1);
  assert.equal(linhaObj.data_registro, "15/08/2026");
  assert.equal(linhaObj.anamnese_alertas, "Sem alergias");
  assert.equal(linhaObj.evolucao_texto, "Restauração realizada");
  assert.equal(linhaObj.assinatura_digital_hash, "");
  assert.equal(linhaObj.ativo, true);
});

test("deletePaciente marca ativo=false sem remover a linha", () => {
  const { sandbox, spreadsheet } = criarAmbiente();

  const linhasAntes = spreadsheet.sheets.Pacientes.data.length;
  const resp = chamarPost(sandbox, { action: "deletePaciente", id: 1 });

  assert.equal(resp.success, true);
  assert.equal(spreadsheet.sheets.Pacientes.data.length, linhasAntes); // nenhuma linha removida

  const dados = spreadsheet.sheets.Pacientes.data;
  const headers = dados[0];
  const idIdx = headers.indexOf("id");
  const ativoIdx = headers.indexOf("ativo");
  const linhaPaciente1 = dados.find((r) => r[idIdx] === 1);

  assert.equal(linhaPaciente1[ativoIdx], false);
});

test("getDashboard calcula agendamentosHoje, itensBaixoEstoque e totais financeiros", () => {
  const { sandbox } = criarAmbiente();

  const resp = chamarGet(sandbox, { action: "getDashboard" });

  assert.equal(resp.success, true);
  assert.equal(resp.resumo.totalPacientes, 2); // ids 1 e 2 ativos (3 está inativo)
  assert.equal(resp.resumo.agendamentosHoje, 1); // só o agendamento id 1 (ativo, data 15/08/2026)
  assert.equal(resp.resumo.itensBaixoEstoque, 2); // Luva (5<=10) e Algodão (10<=10)
  assert.equal(resp.resumo.totalRecebido, 450); // 350 (Recebido) + 100 (Pago)
  assert.equal(resp.resumo.totalReceber, 200); // Limpeza pendente
});

test("parseValorBR converte formatos pt-BR e casos vazios", () => {
  const { sandbox } = criarAmbiente();

  assert.equal(sandbox.parseValorBR("R$ 1.234,56"), 1234.56);
  assert.equal(sandbox.parseValorBR("350,00"), 350);
  assert.equal(sandbox.parseValorBR(250), 250);
  assert.equal(sandbox.parseValorBR(""), 0);
});

test("getUsuarios filtra apenas ativos", () => {
  const { sandbox } = criarAmbiente();

  const resp = chamarGet(sandbox, { action: "getUsuarios" });

  assert.equal(resp.success, true);
  assert.equal(resp.data.length, 2);
  assert.ok(resp.data.every((u) => u.ativo === true));
  assert.ok(resp.data.some((u) => u.nome === "Dr. Pedro"));
  assert.ok(resp.data.some((u) => u.nome === "Recepção Ana"));
});

test("getFinanceiro retorna resumo correto com Receita e Despesa misturadas", () => {
  const { sandbox } = criarAmbiente();

  const resp = chamarGet(sandbox, { action: "getFinanceiro" });

  assert.equal(resp.success, true);
  assert.equal(resp.data.length, 4); // as 4 linhas não-vazias da aba
  assert.equal(resp.resumo.totalRecebido, 450); // Receita Recebido(350) + Receita Pago(100); Despesa ignorada
  assert.equal(resp.resumo.totalReceber, 200); // Receita Pendente(200)
});
