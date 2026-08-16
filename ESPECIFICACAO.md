# 📄 Especificação do Sistema — OdontoSys

> Atualizada em 15/08/2026 para refletir o sistema **como ele é hoje** (versão entregue e funcionando). A visão original da turma foi mantida ao final como roteiro de evolução.

**Nome do projeto:** OdontoSys

**Problema que resolve:** Centralizar a gestão de um consultório odontológico em um único sistema web: cadastro de pacientes, agenda, financeiro, estoque e prontuário eletrônico — com os dados gravados em uma planilha Google compartilhada.

**Público:** Consultório Odontológico (dentistas, auxiliares e recepção) — projeto didático da Turma 2 IA na Prática.

**O sistema em uma frase:** Um painel web hospedado no GitHub Pages que lê e grava, em tempo real, em um banco de dados Google Sheets através de uma API Google Apps Script.

---

## 🏗️ Arquitetura (como funciona)

```
Navegador (GitHub Pages)          Google
┌──────────────────────┐   HTTPS   ┌─────────────────┐   ┌─────────────────┐
│ index.html (painel)  │ ────────► │ Apps Script     │ ► │ Planilha Google │
│ cadastro-usuario.html│  JSON     │ (backend.gs,    │   │ (banco de dados,│
│ odontosys-api-client │ ◄──────── │  Web App /exec) │ ◄ │  11 abas)       │
└──────────────────────┘           └─────────────────┘   └─────────────────┘
```

- **Site:** https://susysvm.github.io/OdontoSys/ (publicado automaticamente pelo GitHub Pages a cada push na branch `main`)
- **Backend:** Google Apps Script publicado como Web App (projeto vinculado à planilha; código-fonte em `backend.gs`, espelhado em `apps-script/backend.js` para deploy via clasp)
- **Banco de dados:** planilha "Projeto do Curso IA na Prática" (ID `1unY03s9nU0G08R5-VROV1Ebdxi9v7qT6myqNGkwahpE`)

### Arquivos do repositório

| Arquivo | Papel |
|---|---|
| `index.html` | Painel principal com os 6 módulos |
| `cadastro-usuario.html` | Página dedicada de cadastro de paciente |
| `odontosys-api-client.js` | Cliente JavaScript da API (usado pelas duas páginas) |
| `backend.gs` | Código do backend (Apps Script) — fonte da verdade |
| `apps-script/` | Projeto clasp (manifesto do Web App + cópia publicada + configuração) |
| `tests/backend.test.mjs` | Testes automatizados do backend (21 testes, `node --test`) |
| `PLANEJAMENTO.md` | Plano de execução por fases (fases 0–6 concluídas) |
| `MANUAL_DE_USO.md` | Manual do usuário final |

---

## ✅ Módulos implementados (funcionando hoje)

### 1. Dashboard
- Cartões: Total de Pacientes (só ativos), Agendamentos Hoje, Receita Total, Itens de Estoque Baixo
- Pré-visualização dos dados recém-sincronizados (pacientes, agendamentos, financeiro)
- Indicador de conexão com a API (verde conectado / vermelho erro)
- Atualização automática a cada 5 minutos + botão "Sincronizar com Planilha"

### 2. Pacientes
- Cadastro completo (página própria, com validação de CPF, e-mail, telefone e máscaras automáticas)
- Listagem com busca por nome, badges de LGPD e situação
- Edição em janela modal (nome, CPF, celular, e-mail, nascimento, endereço, status LGPD)
- Desativar/Reativar (exclusão lógica — nenhum dado é apagado)

### 3. Agendamentos
- Novo agendamento com seleção de paciente e dentista carregados do banco, categoria, procedimento, data, hora e valor
- Listagem ordenada por data/hora com filtros por status e por data
- Fluxo de status: Agendado → Confirmar → Concluir, com Cancelar (mediante confirmação)

### 4. Financeiro
- Cartões de resumo: Recebido e A Receber (calculados pelo backend)
- Lançamento de Receita/Despesa (paciente opcional, vencimento, valor, forma de pagamento)
- "Marcar Recebido" com um clique; filtro por status

### 5. Estoque
- Cadastro de item (nome, categoria, quantidade, mínimo, validade, lote)
- Ajuste rápido de quantidade (+1/−1, nunca negativa)
- Alertas automáticos: **ESTOQUE BAIXO** (quantidade ≤ mínimo, prevalece), **Vencido**, **Validade próxima** (< 60 dias)

### 6. Prontuários & Evolução
- Seleção de paciente com cabeçalho (contato + alerta LGPD)
- Linha do tempo das evoluções (mais recente primeiro) com alertas de anamnese em destaque
- Nova evolução (dentista, alertas, texto clínico)

---

## 🗄️ Banco de dados (planilha)

Abas em uso pelo sistema (cabeçalhos em minúsculas; coluna `ativo` é checkbox):

| Aba | Colunas |
|---|---|
| `Pacientes` | id, nome_completo, cpf, data_nascimento, celular, email, endereco_completo, foto_url, status_lgpd, ativo |
| `Usuarios` | id, nome, perfil_acesso, cro, email_login, foto_url, ativo |
| `Agendamentos` | id, paciente_id, dentista_id, categoria, procedimento, data_consulta, horario_consulta, valor, status, ativo |
| `Financeiro` | id, paciente_id, tipo_movimentacao, descricao, data_vencimento, valor_total, forma_pagamento, status_pagamento, nota_fiscal_url, ativo |
| `Estoque` | id, nome_produto, categoria_produto, quantidade_atual, estoque_minimo, data_validade, lote, ativo |
| `Prontuario_Evolucao` | id, paciente_id, dentista_id, data_registro, anamnese_alertas, evolucao_texto, assinatura_digital_hash, ativo |

Abas já criadas para módulos futuros: `Odontograma_Tratamentos`, `Galeria_Arquivos`, `Prescricoes`, `Comunicacao_Log`. A aba `ODONTOSYS` é **legado** (formato antigo, não usada pelo sistema).

### Regras de dados
- **IDs:** numéricos sequenciais (1, 2, 3…) gerados pelo backend
- **"Excluir" = desativar:** o sistema nunca apaga linhas; marca `ativo = false`
- **Datas:** texto `dd/mm/aaaa`; **horas:** `HH:mm` (o backend normaliza células de data/hora do Sheets automaticamente)
- **Valores:** gravados como texto `R$ 1.234,56`; somas feitas pelo backend com parser pt-BR
- **Status de agendamento:** Agendado, Confirmado, Concluído, Cancelado ("Pendente" legado é tratado como Agendado)

---

## 🔌 API (Apps Script Web App)

Endpoint único (`…/exec`). Leituras via GET `?action=…`; gravações via POST com corpo JSON `{action, …campos}`. Respostas: `{success: true, …}` ou `{success: false, error}`.

| Leituras (GET) | Gravações (POST) |
|---|---|
| getDashboard, getPacientes, getPaciente, getUsuarios, getAgendamentos, getFinanceiro (com resumo), getEstoque, getProntuario | addPaciente, updatePaciente, deletePaciente*, addAgendamento, updateAgendamento, deleteAgendamento*, addFinanceiro, updateFinanceiro, addEstoque, updateEstoque, addProntuario |

\* deletes fazem exclusão lógica (`ativo = false`). Updates são parciais: campos não enviados não são alterados.

### Como atualizar o backend (deploy via clasp)

```
cp backend.gs apps-script/backend.js
cd apps-script
clasp push -f
clasp create-version "descrição da mudança"
clasp update-deployment AKfycbyCcudP043lsbiDXpx8hu8xoLKfbWaM0lsEQ0Kid2AWeaATqjhWJN_ihSw3gu1YQLpgxA -V <nº da versão>
```

A URL pública não muda entre versões. Testes antes de qualquer deploy: `node --test tests/backend.test.mjs` (21 testes).

---

## 🔐 Segurança e LGPD

- A API é **pública e sem login** (`ANYONE_ANONYMOUS`) — necessário para o site estático funcionar. **Aceitável apenas com dados fictícios de aula.** Antes de qualquer paciente real: implementar autenticação (roteiro na Fase 7.2 do PLANEJAMENTO.md).
- Padrões de código obrigatórios no frontend: todo dado vindo da planilha passa por escape antes de entrar no HTML; proibido interpolar dados em atributos inline (`onclick` etc.) — usar `data-*` + delegação de eventos; botões que disparam requisição ficam travados durante a chamada.

---

## 🔮 Visão de futuro (da especificação original da turma — ainda não implementado)

Anamnese inteligente · Odontograma interativo · Plano de tratamento · Prescrições e atestados com PDF · Galeria clínica (fotos, radiografias, tomografias, exames) · Assinatura digital de documentos · Contas a pagar e fluxo de caixa detalhado · Relatórios gerenciais · Login com perfis e permissões (dentista/recepção/admin) · Comunicação automática com pacientes (WhatsApp/SMS/e-mail, lembretes) · Notas fiscais e integração PIX/cartão · Backup automático.

*As abas da planilha para vários desses módulos já existem — o caminho está preparado.*
