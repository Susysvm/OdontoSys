# Correções e Lições — OdontoSys

Este documento existe para a Susysvm (dona do projeto) e para a turma aprenderem com os erros reais encontrados durante a depuração do OdontoSys. Cada item abaixo é um problema que existiu de verdade no sistema, o sintoma que ele causava, como foi corrigido e — o mais importante — como não cair na mesma pegadinha de novo.

A lição geral, repetida em quase todo item: **a tela dizer "sucesso" não prova nada.** A única prova de que um cadastro funcionou é abrir a planilha e ver a linha lá.

---

## Parte 1 — O site não conversava com o banco (frontend)

### 1. Endereço da API montado errado
**O que era:** o site chamava um endereço no formato `.../macros/d/<id>/usercript`, que não existe de verdade para receber pedidos do navegador.
**Sintoma:** toda tentativa de salvar dava erro 404 ("não encontrado"), como discar um telefone com um dígito errado.
**Correção:** o endereço certo de um Apps Script publicado é sempre `https://script.google.com/macros/s/<ID>/exec` (nota o `/s/` e o `/exec` no final).
**Como evitar:** sempre que for configurar a URL da API, copiar exatamente o link que o Google mostra na tela de "Implantar" (Deploy) — nunca digitar ou montar esse endereço à mão.

### 2. Extração do código do deployment pegava a parte errada do link
**O que era:** o código que tentava separar o "ID do deployment" dentro do link colado estava pegando o pedaço `script.google.com` (fixo em todo link) em vez do código único `AKfycb...`.
**Sintoma:** mesmo colando o link certo, o sistema salvava um identificador que não correspondia a nenhum backend real.
**Correção:** ajustar a lógica para pegar o trecho depois de `/s/` e antes de `/exec`, que é o código que realmente identifica QUAL backend está publicado.
**Como evitar:** ao processar uma URL, sempre testar com exemplos reais colados (não só um formato "ideal" imaginado) — URLs do Google têm partes fixas que parecem "o ID" mas não são.

### 3. `fetch` usando opções de outra linguagem
**O que era:** o JavaScript do navegador usava `payload:` e `contentType:`, que são nomes de opções do Apps Script (linguagem que roda no servidor Google), não do `fetch` do navegador.
**Sintoma:** o formulário parecia enviar, mas o servidor recebia um corpo de requisição vazio — como enviar uma carta sem nada dentro do envelope.
**Correção:** trocar para `body:` (nome correto no navegador) e não definir um `Content-Type` explícito, para evitar uma checagem extra do navegador (chamada "preflight") que o Apps Script não sabe responder.
**Como evitar:** lembrar que Apps Script (servidor) e JavaScript de navegador (cliente) são "primos", não a mesma linguagem — nomes de função parecidos podem ter opções diferentes. Testar sempre com o Console do navegador (F12) aberto para ver se a requisição realmente saiu com dados.

### 4. Mesma variável declarada duas vezes
**O que era:** o nome `api` foi declarado com `let` tanto no arquivo do cliente (`odontosys-api-client.js`) quanto dentro da própria página HTML.
**Sintoma:** o navegador trava a execução de TODO o script da página com um erro que não aparece na tela — resultado: botões como "Cadastrar" simplesmente não faziam nada, sem nenhuma mensagem de erro visível para quem estava usando o site.
**Correção:** manter a declaração em um único lugar.
**Como evitar:** esse é o bug mais traiçoeiro porque é silencioso. Sempre abrir o Console do navegador (F12 → aba Console) ao testar um botão que "não faz nada" — o erro de JavaScript geralmente aparece ali em vermelho, mesmo quando a tela não mostra nada.

### 5. Tentativa de alterar uma constante
**O que era:** o código tentava fazer `DEPLOYMENT_URL = novoValor`, mas `DEPLOYMENT_URL` tinha sido criada com `const` (valor fixo, que não pode mudar depois de criado).
**Sintoma:** erro ao tentar salvar uma configuração de URL pela tela.
**Correção:** usar `let` para variáveis que precisam mudar de valor durante o uso do site.
**Como evitar:** usar `const` só para valores que realmente nunca vão mudar; se existe uma tela para o usuário alterar algo, a variável por trás precisa ser `let`.

### 6. URL salva no navegador mas nunca recarregada
**O que era:** quando alguém configurava a URL da API, ela era gravada no `localStorage` (memória do navegador) — mas ao abrir a página de novo, o site nunca ia buscar esse valor salvo, e voltava a usar o padrão de fábrica.
**Sintoma:** a configuração "sumia" toda vez que a página era recarregada.
**Correção:** fazer a página ler o `localStorage` assim que carrega, antes de decidir qual URL usar.
**Como evitar:** toda vez que salvar algo em `localStorage`, escrever também o código que LÊ esse valor ao iniciar a página — são sempre as duas metades do mesmo recurso.

---

## Parte 2 — A causa raiz: o backend publicado era outro

### 7. O deployment publicado era uma versão antiga e diferente do código do repositório
**O que era:** a URL configurada no site apontava para um Apps Script publicado há mais tempo, de uma versão anterior do sistema — que respondia normalmente ("sucesso!") mas não tinha as colunas nem a lógica da planilha atual.
**Sintoma:** o clássico "a tela diz que funcionou, mas nada aparece na planilha". Esse é o sintoma mais enganoso de todos porque parece que está tudo certo.
**Correção:** republicar o backend real (o `backend.gs` deste repositório) via `clasp`, vinculado à planilha da Susysvm, gerando uma URL nova e atualizando o site para usar essa URL nova.
**Como evitar:** sempre que o site "disser sucesso mas não gravar", a primeira suspeita deve ser: "será que a URL configurada é realmente a do código mais recente?" — comparar as colunas que a API devolve com as colunas do arquivo `backend.gs` no repositório e com os cabeçalhos reais da planilha. Se os três não baterem, o deployment publicado está desatualizado.

---

## Parte 3 — Erros dentro do backend (planilha tem suas próprias pegadinhas)

### 8. Backend usando nomes de coluna e de aba diferentes da planilha real
**O que era:** o código do backend esperava colunas como `Nome` e abas como `Prontuário` / `Usuários`, mas a planilha real tinha `nome_completo`, `Prontuario_Evolucao` e `Usuarios` (sem acento).
**Sintoma:** o backend não encontrava a aba (erro "aba não existe") ou lia/gravava na coluna errada.
**Correção:** alinhar o backend exatamente aos nomes reais da planilha.
**Como evitar:** nunca "adivinhar" nomes de aba/coluna — sempre abrir a planilha real e copiar os nomes exatos, incluindo (ou não) acentos e maiúsculas/minúsculas. Acento e caixa (maiúscula/minúscula) importam para o Google Sheets.

### 9. Coluna de checkbox confundia o sistema sobre onde termina a lista
**O que era:** a coluna `ativo` (SIM/NÃO) usa checkbox do Google Sheets, que preenche a grade inteira com `FALSE` até a linha 1000, mesmo em linhas "vazias" que ninguém preencheu.
**Sintoma:** o sistema achava que cada uma dessas 1000 linhas era um paciente de verdade, chegando a contar "999 pacientes" fantasmas no painel; e novos cadastros eram gravados muito longe do fim real da lista.
**Correção:** criar uma regra própria para decidir se uma linha está "realmente vazia" (todas as células vazias ou `false`, não só olhar uma coluna) e gravar sempre na primeira linha livre de verdade.
**Como evitar:** ao usar `getDataRange()` numa aba que tem coluna de checkbox, nunca contar linhas só pelo tamanho da grade — sempre checar se a linha tem conteúdo real em pelo menos um campo de texto.

### 10. Datas e horas viravam texto estranho no JSON
**O que era:** o Google Sheets guarda datas e horas como um tipo especial internamente. Quando esse valor vira JSON sem tratamento, uma data aparece como `1990-05-15T04:00:00...` e uma hora aparece como `30/12/1899` (a "data zero" interna do Sheets, usada só para guardar a hora).
**Sintoma:** campos de data e hora ilegíveis na tela do sistema.
**Correção:** normalizar esses valores no backend antes de responder: se o ano for menor ou igual a 1900, é hora pura (formatar como `HH:mm`); senão, é data (formatar como `dd/MM/yyyy`), sempre usando o fuso horário America/Manaus.
**Como evitar:** nunca devolver células de data/hora "cruas" do Sheets direto no JSON — sempre passar por uma formatação explícita no backend.

### 11. Somas de valores em reais davam resultado errado
**O que era:** valores como "R$ 1.234,56" (formato brasileiro, com ponto de milhar e vírgula decimal) eram jogados direto em `parseFloat`, que entende só o formato americano.
**Sintoma:** somas do módulo financeiro davam números sem sentido (ex.: `1` em vez de `1234.56`).
**Correção:** criar um conversor que primeiro remove "R$" e os pontos de milhar, depois troca a vírgula decimal por ponto, e só então converte para número.
**Como evitar:** todo valor monetário digitado por gente no Brasil precisa desse tratamento antes de virar número — nunca usar `parseFloat` direto em texto com "R$" ou vírgula.

---

## Parte 4 — Segurança e acabamento (achados das revisões finais)

### 12. Dados da planilha dentro de `onclick="..."` — risco real de invasão (XSS)
**O que era:** informações vindas da planilha (que qualquer pessoa com acesso ao formulário pode influenciar) eram coladas diretamente dentro de atributos `onclick="..."` no HTML.
**Sintoma:** nenhum sintoma visível no uso normal — é uma porta aberta que só aparece quando alguém mal-intencionado tenta explorar. Mesmo escapando caracteres HTML, um atributo `onclick` decodifica entidades HTML antes do JavaScript rodar, então o escape sozinho não protege.
**Correção:** trocar por atributos `data-*` (que só guardam texto, sem executar nada) e um único "escutador" de clique central que lê esses atributos — chamado de delegação de eventos.
**Como evitar:** nunca montar `onclick="funcao('" + dado + "')"` com dado vindo de fora do seu controle. Usar sempre `data-*` + um único event listener.

### 13. Botões sem trava durante o envio
**O que era:** os botões de ação (salvar, excluir, etc.) continuavam clicáveis enquanto a requisição para o Google ainda estava em andamento.
**Sintoma:** clique duplo (comum quando a internet está lenta e a pessoa clica de novo por impaciência) duplicava o cadastro ou a operação.
**Correção:** desabilitar o botão assim que clicado, e reabilitar só quando a resposta chegar.
**Como evitar:** todo botão que dispara uma chamada à API deve ficar travado (desabilitado) durante a espera — é um padrão a repetir em qualquer formulário novo.

### 14. Selo de "conectado" sempre verde, mesmo com a API fora do ar
**O que era:** a condição que decidia a cor do selo de status usava `||` (ou) de um jeito que ficava verdadeira mesmo quando a API não respondia.
**Sintoma:** o site mostrava "conectado" mesmo com o backend fora do ar, escondendo o problema de quem está usando.
**Correção:** corrigir a condição para só mostrar "conectado" quando existe uma resposta real e recente da API.
**Como evitar:** indicadores de status devem ser testados também no cenário "desligado de propósito" (ex.: tirando a internet ou apontando para uma URL errada) — não só no cenário feliz.

### 15. Campo "Observações" era digitado mas descartado sem aviso
**O que era:** a tela de cadastro tinha um campo de "Observações", mas a planilha não tinha essa coluna — o backend simplesmente ignorava o valor.
**Sintoma:** a pessoa digitava uma observação, o sistema dizia "sucesso", mas a informação sumia sem explicação.
**Correção:** documentado e alinhado — campo removido do fluxo até que a coluna exista na planilha (ver pendências no `ESPECIFICACAO.md`).
**Como evitar:** todo campo de formulário precisa ter uma coluna correspondente na planilha ANTES de ser adicionado à tela; se o campo existe só "para o futuro", avisar isso visualmente para quem usa.

### 16. Status antigo "Pendente" ficava sem nenhum botão de ação
**O que era:** registros antigos, gravados antes da padronização de status, tinham o valor "Pendente", que não fazia parte da lista de status que o sistema atual reconhece.
**Sintoma:** essas linhas apareciam na tela mas sem nenhum botão de ação disponível — pareciam "travadas".
**Correção:** tratar esse status legado como equivalente a um dos status válidos atuais, para as linhas antigas continuarem utilizáveis.
**Como evitar:** ao mudar o vocabulário de status de um sistema, sempre pensar no que acontece com os dados antigos que usam o vocabulário anterior — não só nos dados novos.

### 17. Nome do dentista aparecia duplicado ("Dr(a). Dra. Aline")
**O que era:** o prefixo "Dr(a)." era adicionado pela tela, mas o nome já vinha da planilha com "Dra." incluso.
**Sintoma:** nome esquisito duplicado na tela de Prontuários.
**Correção:** remover o prefixo fixo do código, já que a planilha já traz o tratamento correto no nome.
**Como evitar:** ao formatar texto que vem de uma fonte de dados, checar se a fonte já não formatou aquilo — evita duplicar prefixos/sufixos.

---

## Boas práticas que já estavam certas (e vale manter)

- **Soft delete** (`ativo = false`) em vez de apagar linha de verdade — nenhum dado histórico se perde por engano.
- **Testes automatizados do backend** (21 testes) rodando com `node --test`, simulando a planilha do Google — pegam erro antes de publicar.
- **Nunca confiar na mensagem de sucesso da tela** — a prova de verdade é sempre abrir a planilha e ver a linha.
- **Registro de teste marcado e depois removido** em todo teste ponta a ponta feito na planilha real — nunca deixar "lixo de teste" misturado com dados verdadeiros.

---

*Documento criado como parte do processo padrão de entrega dos projetos da Turma 2 IA na Prática. Serve como material de estudo — não é preciso entender de programação para ler; cada item explica o problema com uma comparação do dia a dia.*
