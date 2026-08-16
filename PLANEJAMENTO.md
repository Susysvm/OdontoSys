# 🗺️ Planejamento — Fazer todas as funções da vitrine funcionarem

> **Objetivo:** transformar a vitrine (index.html) de "fachada bonita" em sistema funcionando de verdade, com cada módulo lendo e gravando na planilha Google (banco de dados).
>
> **Arquitetura:** HTML estático (GitHub Pages) → `odontosys-api-client.js` → Google Apps Script (`backend.gs`) → Planilha Google `1unY03s9nU0G08R5-VROV1Ebdxi9v7qT6myqNGkwahpE`.
>
> **Como cada tarefa é verificada:** teste real no navegador (preencher → salvar) + conferência de que o dado apareceu/mudou na planilha.

## 📋 Diagnóstico da vitrine (situação em 15/08/2026)

| Módulo | O que existe hoje | Funciona? |
|---|---|---|
| Dashboard | 4 cartões de métricas + tabela de pré-visualização | ⚠️ Parcial — busca dados, mas mapeia colunas antigas e mostra dados falsos quando vazio |
| Pacientes | Botão "Novo Paciente" → página de cadastro | ⚠️ Cadastro envia, mas **não há listagem**; gravação depende da Fase 0 |
| Agendamentos | Botão "Novo Agendamento" | ❌ Botão só abre um aviso decorativo |
| Financeiro | Só o texto "carregamento pronto" | ❌ Nada implementado |
| Estoque | Só o texto "carregamento pronto" | ❌ Nada implementado |
| Prontuários | Só o texto "carregamento pronto" | ❌ Nada implementado |
| Config da API | Salva URL no navegador | ⚠️ Salva mas **nunca lê** o que salvou ao recarregar |

**A planilha-banco já está pronta** e é mais completa que a vitrine: tem abas estruturadas com dados de exemplo para Pacientes, Usuarios (dentistas), Agendamentos, Prontuario_Evolucao, Odontograma_Tratamentos, Financeiro, Galeria_Arquivos, Prescricoes, Estoque e Comunicacao_Log.

⚠️ **Decisão para a equipe:** existe também uma aba `ODONTOSYS` ("tudo em uma tabela só", formato antigo). Recomendação: usar as abas separadas (Pacientes, Agendamentos, ...) como banco oficial e aposentar a aba ODONTOSYS.

---

## 🚧 FASE 0 — Destravar o banco (BLOQUEIO — precisa de ação humana)

Nada grava na planilha enquanto isso não for feito. A URL de API configurada hoje aponta para um Apps Script antigo que responde "sucesso" mas não grava (comprovado em teste: nenhum registro chega a nenhuma aba).

- [ ] **0.1 Republicar o backend** (quem for dono da planilha — ou dar acesso de editor ao Luciano):
  1. Abrir a planilha → **Extensões → Apps Script**
  2. Apagar o código existente e colar o conteúdo do `backend.gs` deste repositório
  3. **Implantar → Novo deployment → App da Web** → Executar como: **eu** → Acesso: **Qualquer pessoa**
  4. Autorizar quando o Google pedir e copiar a URL gerada (`https://script.google.com/macros/s/.../exec`)
- [ ] **0.2 Trocar a `DEPLOYMENT_URL`** nos dois arquivos: `index.html` e `cadastro-usuario.html` (1 linha em cada) e fazer push
- [ ] **0.3 Teste de aceite:** cadastrar um paciente pelo site publicado e confirmar que a linha apareceu na aba `Pacientes`

## 🔧 FASE 1 — Backend completo alinhado ao banco real (`backend.gs`)

O cadastro de paciente já foi alinhado (15/08/2026). Falta alinhar os demais módulos, que ainda usam nomes de coluna antigos que não existem na planilha:

- [ ] **1.1 Agendamentos** → colunas reais: `id, paciente_id, dentista_id, categoria, procedimento, data_consulta, horario_consulta, valor, status, ativo`
- [ ] **1.2 Financeiro** → `id, paciente_id, tipo_movimentacao, descricao, data_vencimento, valor_total, forma_pagamento, status_pagamento, nota_fiscal_url, ativo` (resumo: "Recebido" conta como pago)
- [ ] **1.3 Estoque** → `id, nome_produto, categoria_produto, quantidade_atual, estoque_minimo, data_validade, lote, ativo` (alerta quando `quantidade_atual <= estoque_minimo`)
- [ ] **1.4 Prontuário** → gravar na aba `Prontuario_Evolucao`: `id, paciente_id, dentista_id, data_registro, anamnese_alertas, evolucao_texto, assinatura_digital_hash, ativo`
- [ ] **1.5 Nova ação `getUsuarios`** (aba `Usuarios`) para listar dentistas nos formulários
- [ ] **1.6 Dashboard real:** contagens usando os campos novos (`data_consulta` de hoje, `status_pagamento`, estoque baixo por `estoque_minimo`)
- [ ] **1.7 "Apagar" vira desativar:** em vez de excluir linha, marcar `ativo = FALSE` (mais seguro; exigência boa para dados de saúde)
- [ ] **Aceite da fase:** cada ação testada com requisição direta (curl) + linha certa na aba certa

## 👥 FASE 2 — Módulo Pacientes completo (index.html)

- [ ] **2.1 Listagem real:** tabela com nome, CPF, celular, e-mail, status LGPD e situação (ativo), lida da aba `Pacientes`; campo de busca por nome
- [ ] **2.2 Editar e desativar:** botão de editar (abre janelinha com os dados) e botão de desativar com confirmação
- [ ] **2.3 Consertar a pré-visualização do Dashboard:** usar os nomes de coluna reais (`nome_completo` etc.) e **remover os dados de demonstração falsos** (se vazio, dizer "sem dados" — não enganar)
- [ ] **Aceite:** editar um paciente no site → mudança visível na planilha, e vice-versa

## 📅 FASE 3 — Módulo Agendamentos

- [ ] **3.1 Formulário real de "Novo Agendamento":** escolher paciente (lista carregada do banco), dentista (aba Usuarios), data, hora, categoria, procedimento e valor
- [ ] **3.2 Listagem com filtros** por data e status; botões para Confirmar / Concluir / Cancelar (muda o `status`)
- [ ] **Aceite:** criar agendamento no site → linha na aba `Agendamentos` com `paciente_id` correto; card "Agendamentos Hoje" do dashboard bate com a planilha

## 💰 FASE 4 — Módulo Financeiro

- [ ] **4.1 Lançamentos:** formulário de receita/despesa (paciente, descrição, vencimento, valor, forma de pagamento, status)
- [ ] **4.2 Lista + cartões de resumo:** Recebido, A Receber, e marcação rápida "Recebido"
- [ ] **Aceite:** valores dos cartões conferem com a soma manual da aba `Financeiro`

## 📦 FASE 5 — Módulo Estoque

- [ ] **5.1 Lista com alerta visual** de estoque baixo (quantidade ≤ mínimo) e validade próxima
- [ ] **5.2 Adicionar item e ajustar quantidade** (entrada/saída)
- [ ] **Aceite:** card "Itens Estoque Baixo" do dashboard bate com a regra da planilha

## 📋 FASE 6 — Módulo Prontuários & Evolução

- [ ] **6.1 Selecionar paciente → ver histórico** de evoluções (aba `Prontuario_Evolucao`)
- [ ] **6.2 Adicionar evolução** (dentista, alertas de anamnese, texto)
- [ ] **Aceite:** evolução criada no site aparece na planilha ligada ao `paciente_id` certo

## ✨ FASE 7 — Acabamento e extras (opcional)

- [ ] **7.1 Config da API funcional:** ler a URL salva no navegador ao carregar (hoje salva e ignora)
- [ ] **7.2 Login simples** usando a aba `Usuarios` (perfil Dentista/Recepção) — decidir se vale para a aula
- [ ] **7.3 Módulos futuros que a planilha já suporta:** Prescrições (receituário), Galeria de Arquivos (raio-X), Odontograma, Log de Comunicação (lembretes WhatsApp)

---

## 🔐 Aviso importante de segurança (LGPD)

A API do backend é **pública e sem login** (`access: ANYONE_ANONYMOUS`) — é o que permite o site no GitHub Pages funcionar sem conta Google, mas significa que **qualquer pessoa com o link consegue ler e gravar dados**. Enquanto a planilha tiver só dados fictícios de aula, tudo bem. **Antes de qualquer uso com pacientes reais**, é obrigatório implementar autenticação de verdade (Fase 7.2 — login) ou migrar para um backend com controle de acesso; dados de saúde reais neste modelo violariam a LGPD.

## ⚠️ Riscos e observações

1. **Fase 0 é pré-requisito de tudo** — sem republicar o Apps Script, o site continua "fingindo" que salva.
2. Datas na planilha estão no formato brasileiro (15/10/2023); os formulários devem gravar nesse mesmo formato.
3. A coluna `ativo` é checkbox e preenche a grade toda com FALSE — o `backend.gs` já foi corrigido para não se perder com isso (não usar `appendRow` puro).
4. Dados de exemplo (Maria Silva etc.) podem ser limpos quando o sistema real entrar em uso.

*Planejamento criado em 15/08/2026 durante a depuração do cadastro. Dúvidas: falar com Luciano.*
