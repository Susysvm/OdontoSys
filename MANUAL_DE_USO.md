# 📖 Manual de Uso — OdontoSys

> Manual para quem vai **usar** o sistema no dia a dia (recepção, dentistas, auxiliares). Não é preciso saber nada de tecnologia. Atualizado em 15/08/2026.

## 🚪 Como entrar no sistema

Abra no navegador (computador, tablet ou celular):

**👉 https://susysvm.github.io/OdontoSys/**

Não precisa instalar nada nem fazer login. Ao abrir, observe o **selo no topo direito**:

- 🟢 **"API Google Conectada"** → tudo certo, pode usar
- 🔴 **"Modo Demonstração / Offline"** → o sistema não conseguiu falar com o banco de dados; veja [Problemas comuns](#-problemas-comuns)

Os dados ficam guardados numa planilha Google. Tudo o que você salvar no site aparece nela na hora (e vice-versa).

O menu à esquerda tem os 6 módulos: **Dashboard, Pacientes, Agendamentos, Financeiro, Estoque, Prontuários**.

---

## 📊 Dashboard (visão geral)

É a primeira tela. Mostra:
- **Total Pacientes** — pacientes ativos cadastrados
- **Agendamentos Hoje** — consultas marcadas para a data de hoje
- **Receita Total** — soma de tudo que já foi recebido
- **Itens Estoque Baixo** — produtos que precisam de reposição

Os números se atualizam sozinhos a cada 5 minutos. Para forçar, clique em **"Sincronizar com Planilha"**.

---

## 👥 Pacientes

### Cadastrar um paciente novo
1. No módulo Pacientes, clique em **"Novo Paciente"** (abre a página de cadastro)
2. Preencha ao menos os campos com **\***: Nome, Email e Telefone (CPF, nascimento e endereço são opcionais)
3. Clique em **"Cadastrar Paciente"** e aguarde a mensagem verde de sucesso
4. Use **"Cadastrar Outro"** ou **"Voltar ao Dashboard"**

O CPF, o telefone e o CEP ganham pontuação automaticamente enquanto você digita. Se algum dado estiver inválido (ex.: CPF com dígito errado), o sistema avisa e não envia.

### Encontrar, editar ou desativar
- **Buscar:** digite parte do nome na caixa de busca — a lista filtra na hora
- **Editar:** clique em **Editar** na linha do paciente, altere na janelinha e salve
- **Desativar:** clique em **Desativar** e confirme. O paciente sai das contagens, mas **nada é apagado** — ele fica com a etiqueta "Inativo" e pode ser **Reativado** a qualquer momento
- **LGPD:** a etiqueta mostra se o paciente já assinou o termo (Assinado / Pendente / Recusado) — atualize pelo Editar

---

## 📅 Agendamentos

### Marcar uma consulta
1. No módulo Agendamentos, clique em **"Novo Agendamento"**
2. Escolha o **Paciente** e o **Dentista** nas listas (aparecem os cadastrados no sistema)
3. Escolha categoria (Avaliação/Tratamento/Retorno/Urgência), escreva o procedimento, defina **data e hora** e, se quiser, o valor
4. Salve — a consulta nasce com status **Agendado**

### Acompanhar e mudar o status
Cada consulta segue o fluxo: **Agendado → Confirmado → Concluído** (ou **Cancelado**).

- Na linha da consulta, use os botões **Confirmar**, **Concluir** ou **Cancelar** (cancelar pede confirmação)
- Use os **filtros** acima da tabela para ver só um status ou só um dia
- A lista vem ordenada da consulta mais próxima para a mais distante

---

## 💰 Financeiro

### Entender os cartões
- **Recebido:** soma das receitas já pagas
- **A Receber:** receitas ainda pendentes

### Lançar uma receita ou despesa
1. Clique em **"Novo Lançamento"**
2. Escolha **Receita** (dinheiro que entra) ou **Despesa** (que sai)
3. Vincule a um paciente (opcional — despesas costumam não ter), descreva, informe vencimento, valor e forma de pagamento (PIX, cartão etc.)
4. Salve com status **Pendente** ou já **Recebido**

### Receber um pagamento
Na linha do lançamento pendente, clique em **"Marcar Recebido"** e confirme — os cartões se atualizam sozinhos.

---

## 📦 Estoque

### Cadastrar um produto
Clique em **"Novo Item"** e informe: nome, categoria, **quantidade atual**, **estoque mínimo** (o sistema avisa quando chegar nesse nível), validade e lote.

### Entender as etiquetas de situação
- 🔴 **ESTOQUE BAIXO** — quantidade chegou no mínimo: hora de repor (este é o alerta que conta no Dashboard)
- 🟠 **Vencido** / **Validade próxima** — atenção à data de validade (menos de 60 dias)
- 🟢 **OK** — tudo certo

### Dar baixa ou entrada rápida
Use os botões **+1** e **−1** na linha do produto (a quantidade nunca fica negativa).

---

## 📋 Prontuários & Evolução

### Ver o histórico de um paciente
1. No módulo Prontuários, escolha o paciente na lista e clique em **"Ver Prontuário"**
2. O cabeçalho mostra o contato e um aviso caso o termo LGPD não esteja assinado
3. A linha do tempo mostra cada atendimento (mais recente primeiro), com o dentista, a data e — em destaque âmbar — os **alertas de anamnese** (ex.: alergias)

### Registrar um atendimento
1. Com o paciente selecionado, clique em **"Nova Evolução"**
2. Escolha o dentista, preencha alertas de anamnese (se houver) e descreva a evolução clínica (obrigatório)
3. Salve — o registro entra no topo da linha do tempo

⚠️ Registro clínico não pode ser editado nem apagado pelo sistema — escreva com atenção.

---

## ❓ Problemas comuns

| Sintoma | O que fazer |
|---|---|
| Selo vermelho "Erro de Conexão" | Verifique sua internet e recarregue a página (F5). Se persistir, avise o responsável técnico — a API pode estar fora do ar |
| Cadastrei e não apareceu na lista | Clique em **"Recarregar"** dentro do módulo (a lista usa memória local para ser rápida) |
| A tela demora alguns segundos | Normal — o banco é uma planilha Google e cada consulta viaja até o servidor do Google |
| Alterei a planilha e o site não mudou | Clique em "Sincronizar com Planilha" (Dashboard) ou em "Recarregar" no módulo |
| Excluí um paciente sem querer | Respire! Nada é apagado — clique em **Reativar** na linha dele |

### ⚠️ Regras de ouro
1. **Não mexa nos cabeçalhos da planilha** (linha 1 de cada aba) nem renomeie as abas — o sistema depende exatamente desses nomes
2. Prefira sempre **usar o site** em vez de digitar direto na planilha — o site valida os dados e gera os códigos certos
3. **Este sistema é um projeto de aula: use apenas dados fictícios.** Os dados são públicos para quem tiver o link — não cadastre pacientes reais antes de o sistema ganhar login (ver PLANEJAMENTO.md)

---

## 🔗 Links úteis

- **Sistema:** https://susysvm.github.io/OdontoSys/
- **Cadastro direto:** https://susysvm.github.io/OdontoSys/cadastro-usuario.html
- **Planilha (banco de dados):** https://docs.google.com/spreadsheets/d/1unY03s9nU0G08R5-VROV1Ebdxi9v7qT6myqNGkwahpE/edit
- **Documentação técnica:** [ESPECIFICACAO.md](ESPECIFICACAO.md) · **Roadmap:** [PLANEJAMENTO.md](PLANEJAMENTO.md)
