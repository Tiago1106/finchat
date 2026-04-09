# FinChat - Regras de Negócio

> App de controle financeiro pessoal via chat com inteligência artificial.

---

## 1. Visão Geral

App de controle financeiro pessoal onde o usuário registra gastos via mensagens em linguagem natural. Uma IA interpreta a mensagem, categoriza o gasto e salva após confirmação do usuário.

---

## 2. Autenticação & Multi-usuário

- Sistema multi-usuário com cadastro/login
- Cada usuário tem seus próprios registros, categorias e dashboard
- Dados isolados por usuário

---

## 3. Registro de Gastos via Chat

### Fluxo Principal

1. Usuário envia mensagem: `"300 ração 3x"`
2. IA interpreta:
   - **Valor total:** R$ 300,00
   - **Descrição:** Ração
   - **Parcelas:** 3x (R$ 100,00/mês)
   - **Categoria sugerida:** Pets
   - **Método de pagamento:** Crédito (parcelou = assume crédito, editável)
   - **Cartão:** (se informado na mensagem, usa; senão, segue fluxo abaixo)
3. Sistema exibe a interpretação e pede **confirmação**
4. Usuário confirma → registro salvo
5. Usuário corrige → sistema ajusta e pede nova confirmação

### Fluxo de Identificação do Método e Cartão

A IA segue esta ordem:

1. **Método informado na mensagem?**
   - Sim (`"50 gasolina pix"`) → usa o método informado
   - Não → verifica se tem `Nx` (parcelamento)
     - Se tem `Nx` → assume **crédito** (editável na confirmação)
     - Se não tem `Nx` → IA pergunta ou usa o **método padrão** do usuário

2. **Se o método é crédito → precisa de cartão:**
   - Cartão informado na mensagem (ex: `"300 ração 3x nubank"`) → vincula
   - Cartão não informado:
     - Se tem cartões cadastrados → pergunta **qual cartão**
     - Se não tem cartões → sugere cadastrar, ou registra com **mês calendário** como fallback

3. **Se o método é débito / pix / dinheiro:**
   - Não precisa de cartão
   - Registra direto com a **data do gasto**

### Formatos Aceitos (exemplos)

| Mensagem | Interpretação |
|---|---|
| `300 ração 3x` | R$300 em Ração, 3 parcelas de R$100, crédito (IA assume) |
| `300 ração 3x nubank` | R$300 em Ração, 3 parcelas de R$100, crédito, cartão Nubank |
| `150 mercado pix` | R$150 em Mercado, via Pix |
| `50 gasolina pix` | R$50 em Gasolina, via Pix |
| `1200 aluguel débito` | R$1200 em Aluguel, no débito |
| `45.90 uber` | R$45,90 em Uber, à vista (IA pergunta método ou usa padrão) |

---

## 4. Categorias

### Categorias Base Pré-definidas

| Categoria | Exemplos de descrições |
|---|---|
| Alimentação | mercado, restaurante, ifood, lanche |
| Transporte | gasolina, uber, estacionamento, pedágio |
| Moradia | aluguel, condomínio, luz, água, internet |
| Pets | ração, veterinário, petshop |
| Lazer | cinema, bar, bebida, viagem |
| Saúde | farmácia, médico, academia |
| Educação | curso, livro, mensalidade |
| Vestuário | roupa, calçado, acessório |
| Outros | o que não se encaixa em nenhuma |

### Comportamento da IA com Categorias

- A IA mapeia automaticamente a descrição para uma categoria existente
  - "ração" → Pets
  - "gasolina" → Transporte
  - "mercado" → Alimentação
- Se a IA **não encontrar** categoria adequada, ela **sugere** uma nova categoria
- Usuário aprova ou escolhe outra
- O sistema mantém um **dicionário de associações** descrição → categoria por usuário (ver seção 12)

### Dados da Categoria

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Não | Se NULL = categoria global (pré-definida). Se preenchido = categoria criada pelo usuário |
| name | String | Sim | Nome da categoria (ex: "Alimentação", "Pets") |
| icon | String | Não | Ícone representativo (para o dashboard) |
| created_at | DateTime | Sim | Data de criação |

---

## 5. Parcelas (Parcelamento)

- Quando o usuário informa `Nx`, o sistema:
  - **Assume automaticamente que é crédito** (editável na confirmação)
  - Registra o **valor total** da compra
  - Gera **N lançamentos futuros** automaticamente (um por mês)
  - Cada lançamento = valor_total / N
  - **Arredondamento:** a primeira parcela absorve o centavo excedente (ex: R$1.000 em 3x → R$333,34 + R$333,33 + R$333,33)
  - Mês inicial = mês do registro (respeitando o ciclo de fatura do cartão, se cadastrado)
- Se não informar `Nx`, o lançamento é considerado **à vista** (parcela única)
- Dashboard mostra apenas o valor da parcela correspondente ao mês/fatura visualizado
- Parcelas ficam vinculadas entre si (mesma compra via `installment_group_id`)
- Se tem cartão cadastrado → as parcelas seguem o **ciclo de fatura** do cartão
- Se não tem cartão → parcelas entram no **mês calendário** (fallback)

---

## 6. Método de Pagamento

### Opções Disponíveis

- **Crédito**
- **Débito**
- **Pix**
- **Dinheiro**

### Regras

- Pode ser informado na mensagem: `"50 gasolina pix"`
- Se não informado, a IA pergunta ou usa um **padrão configurável** pelo usuário
- Cada usuário pode definir seu método de pagamento padrão nas configurações

---

## 7. Cartões de Crédito

Gastos no crédito podem ser vinculados a um **cartão de crédito** cadastrado (ex: Nubank, PicPay, Pão de Açúcar). O cartão define o **ciclo de fatura** que determina em qual mês o gasto aparece no dashboard.

> Gastos no débito, pix ou dinheiro **não precisam** de cartão/conta vinculado. Apenas o método de pagamento é registrado.

### Dados do Cartão de Crédito

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Sim | Referência ao usuário |
| name | String | Sim | Apelido do cartão (ex: "Nubank", "PicPay") |
| closing_day | Integer | Sim | Dia de fechamento/corte da fatura (1-31) — define em qual mês o gasto entra |
| due_day | Integer | Sim | Dia de vencimento da fatura (1-31) — para notificações de pagamento |
| credit_limit | Decimal | Não | Limite total do cartão |
| created_at | DateTime | Sim | Data de criação |

> **Para cadastrar um cartão, o usuário precisa informar:** apelido, dia de fechamento e dia de vencimento. Limite é opcional.

### Cadastro Híbrido

- O usuário pode **pré-cadastrar** seus cartões nas configurações
- Se digitar um nome novo no chat em um gasto de crédito (ex: `"300 ração 3x picpay"`), o sistema sugere cadastrá-lo (pedindo apelido, fechamento e vencimento)
- Uma vez cadastrado, o sistema reconhece automaticamente nas próximas mensagens

### Impacto no Dashboard

- Ver detalhes na **seção 9.2 (Faturas)** — gastos agrupados por cartão com barra de limite e alerta de vencimento

---

## 8. Regra de Datas e Ciclo de Fatura

O sistema trata datas de forma diferente dependendo do método de pagamento:

### 8.1 Gastos no Crédito (com cartão cadastrado)

- Usa o **ciclo de fatura do cartão** baseado na data de **fechamento (corte)**
- O gasto entra na fatura do mês em que o ciclo está aberto
- Exemplo: Cartão Nubank fecha dia 3
  - Gasto em 28/03 → fatura que fecha em 03/04 → aparece como gasto de **abril**
  - Gasto em 05/04 → fatura que fecha em 03/05 → aparece como gasto de **maio**
- O dashboard mostra os gastos conforme o ciclo da fatura, **não pelo mês calendário**

### 8.2 Gastos no Crédito (sem cartão cadastrado)

- O sistema **sugere cadastrar um cartão** (pedindo apelido, fechamento e vencimento)
- Se o usuário não quiser cadastrar, o gasto entra no **mês calendário** como fallback (01 a 30/31)

### 8.3 Gastos no Débito / Pix / Dinheiro

- Sempre usa a **data do gasto** (mês calendário)
- Sem ciclo de fatura
- Exemplo: Gasto em 15/04 via Pix → aparece em **abril** (01/04 a 30/04)

### 8.4 Resumo da Lógica

| Método | Base da data | Referência |
|---|---|---|
| Crédito (com cartão) | Ciclo de fatura do cartão (closing_day) | Mês da fatura |
| Crédito (sem cartão) | Mês calendário (01 a 30/31) — fallback | Data do gasto |
| Débito | Mês calendário | Data do gasto |
| Pix | Mês calendário | Data do gasto |
| Dinheiro | Mês calendário | Data do gasto |

---

## 9. Dashboard

### Estrutura do Dashboard

O dashboard é organizado em **3 visões** ao selecionar um mês (ex: Abril):

#### 9.1 Resumo do Mês (visão unificada)

- **Total gasto no mês** somando tudo: faturas de crédito do mês + gastos diretos (débito/pix/dinheiro) do mês
- Comparação com mês anterior (% aumento/redução)
- Gráfico pizza ou barras mostrando distribuição dos gastos **por categoria** (valores absolutos e percentuais)
- Gráfico de linha com **evolução dos gastos** ao longo dos meses (possibilidade de filtrar por categoria)

#### 9.2 Seção "Faturas" (crédito)

- Gastos que caem no **ciclo de fatura** de cada cartão no mês selecionado
- Agrupados por cartão (Nubank, PicPay, etc.)
- **Barra de utilização do limite** (ex: R$1.200 de R$3.000 usado)
- **Alerta de vencimento** de fatura
- Parcelas ativas vinculadas a cada cartão

#### 9.3 Seção "Gastos Diretos" (débito / pix / dinheiro)

- Gastos pela **data do gasto** no mês calendário (01 a 30/31)
- Sem ciclo de fatura
- Agrupados por método de pagamento

#### 9.4 Extrato

- Lista cronológica de **todos** os lançamentos (crédito + diretos)
- Filtros disponíveis:
  - Categoria
  - Método de pagamento
  - Cartão de Crédito
  - Período (data início / data fim)
  - Valor (mínimo / máximo)

#### 9.5 Parcelas Ativas

- Visão de todas as parcelas em andamento
- Quanto já foi pago vs. quanto falta
- Próximas parcelas a vencer
- Em qual cartão cada parcela está

---

## 10. Dados do Lançamento

Cada lançamento (expense) contém:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Sim | Referência ao usuário |
| description | String | Sim | Descrição do gasto (texto original) |
| total_amount | Decimal | Sim | Valor total da compra |
| installment_amount | Decimal | Sim | Valor da parcela (= total / parcelas) |
| installments | Integer | Sim | Número de parcelas (1 = à vista) |
| installment_number | Integer | Sim | Número da parcela atual (1 de N) |
| installment_group_id | UUID | Não | ID que agrupa parcelas da mesma compra |
| category_id | UUID | Sim | Referência à categoria |
| card_id | UUID | Não | Referência ao cartão de crédito (somente se payment_method = credit) |
| payment_method | Enum | Sim | credit, debit, pix, cash |
| date | Date | Sim | Data real do gasto (padrão = data do registro, editável) |
| billing_month | String | Não | Mês de referência da fatura (ex: "2026-04"). Calculado na criação com base em date + closing_day do cartão. Somente para crédito com cartão cadastrado. |
| created_at | DateTime | Sim | Data/hora de criação |
| confirmed | Boolean | Sim | Se o usuário confirmou o lançamento |

---

## 11. Dados da Conversa (Chat)

O histórico de conversas fica salvo para consulta. Cada usuário tem suas conversas.

### Conversa (conversation)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Sim | Referência ao usuário |
| created_at | DateTime | Sim | Data/hora de criação da conversa |
| updated_at | DateTime | Sim | Data/hora da última mensagem |

### Mensagem (message)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| conversation_id | UUID | Sim | Referência à conversa |
| role | Enum | Sim | user, assistant |
| content | String | Sim | Conteúdo da mensagem |
| expense_id | UUID | Não | Referência ao lançamento gerado por esta mensagem (se houver) |
| created_at | DateTime | Sim | Data/hora de criação |

---

## 12. Dicionário de Associações (descrição → categoria)

O sistema mantém um dicionário por usuário que mapeia descrições a categorias. Isso permite que a IA melhore as sugestões com o tempo, aprendendo as preferências do usuário.

### Associação (category_mapping)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Sim | Referência ao usuário |
| keyword | String | Sim | Palavra-chave da descrição (ex: "ração", "uber") |
| category_id | UUID | Sim | Referência à categoria associada |
| created_at | DateTime | Sim | Data de criação |
| updated_at | DateTime | Sim | Data da última atualização |

### Regras

- Quando o usuário **confirma** um lançamento, a associação descrição→categoria é salva/atualizada automaticamente
- Se o usuário **corrige** a categoria sugerida, a associação é atualizada com a nova escolha
- Na próxima vez que a mesma descrição aparecer, o sistema usa o dicionário **antes** de consultar a IA (prioridade: dicionário do usuário > IA)

---

## 13. Regras Gerais

- Todos os valores em **Real (BRL)**
- Lançamentos são sempre vinculados a uma **data** (padrão = data do registro, mas editável)
- Histórico de conversas no chat fica salvo para consulta
- Lançamentos só são salvos após **confirmação** do usuário
- Usuário pode **editar** e **excluir** lançamentos após salvar

---

## 14. Roadmap de Versões

| Versão | Funcionalidades |
|---|---|
| **V1 - MVP** | Registro de gastos via chat, categorias com IA, parcelas, dashboard completo, multi-usuário, métodos de pagamento, cartões de crédito com ciclo de fatura |
| **V2** | Registro de receitas (salário, freelance, etc.), orçamento mensal por categoria com alertas, balanço receitas vs. gastos |
| **V3** | Relatórios exportáveis (PDF, CSV), integração com mensageiros (Telegram/WhatsApp), gastos recorrentes automáticos |

---

## 15. Decisões Tecnológicas (Resolvidas)

> Detalhes técnicos em [ARQUITETURA.md](./ARQUITETURA.md) | Design e UI em [DESIGN.md](./DESIGN.md)

- [x] **Frontend:** Expo (React Native) + TypeScript — app mobile nativo
- [x] **Backend:** NestJS + TypeScript (Node.js separado)
- [x] **Banco de dados:** PostgreSQL via Docker local (Drizzle ORM)
- [x] **IA:** Ollama local (modelo a definir nos testes) — migrável para API paga no futuro
- [x] **Autenticação:** JWT próprio (bcrypt + jsonwebtoken)
- [x] **Interface do chat:** App mobile (Expo) com tela de chat integrada
- [x] **Infra:** Docker Compose (Postgres + Ollama), zero custo
- [x] **Design System:** Tamagui — compilação otimizada, tokens de design, componentes prontos
- [x] **Estado global:** Zustand — leve, sem boilerplate, seletores otimizados
- [x] **API + Cache:** TanStack React Query — cache, refetch, loading states
- [x] **Identidade visual:** Dark-first, verde menta (#57F2BE), fonte K2D, 3 bottom tabs (Chat, Dashboard, Config)
- [x] **Navegação:** Chat como tela principal, Dashboard com 5 sub-tabs, Config com sub-telas
