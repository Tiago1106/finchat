# FinChat - Design System & UI Guide

> Documento de identidade visual, tokens de design, componentes e especificação de telas do FinChat.
> Referência visual baseada no app PayUp, adaptada para um app de controle financeiro via chat com IA.

---

## 1. Identidade Visual

### Conceito

O FinChat é um app de controle financeiro pessoal onde o usuário registra gastos conversando com uma IA. A interface deve transmitir:

- **Confiança** - tema escuro e cores sóbrias passam seriedade para dados financeiros
- **Simplicidade** - o chat é o centro; poucos toques para registrar um gasto
- **Inteligência** - a IA interpreta linguagem natural, o design deve evidenciar essa "mágica"

### Tom Visual

| Atributo | Valor |
|---|---|
| **Tema principal** | Dark-first |
| **Estilo** | Minimal, clean, flat |
| **Personalidade** | Financeiro + conversacional |
| **Inspirações** | PayUp (layout/estrutura), Cleo AI (chat financeiro), Nubank (cores/dark mode) |

### Cor de Acento

Verde menta (`#57F2BE`) - transmite crescimento financeiro, é vibrante sem ser agressivo, e tem excelente contraste sobre fundos escuros.

---

## 2. Paleta de Cores

### Cores de Superfície

| Token | Hex | Uso |
|---|---|---|
| `background` | `#0F110E` | Fundo principal do app |
| `surface` | `#161616` | Cards, botões secundários, bolhas da IA |
| `surface-elevated` | `#1B1B1B` | Inputs, superfícies elevadas, modais |
| `border-subtle` | `#2D2D2D` | Bordas sutis, divisores, strokes de inputs |
| `border` | `#303030` | Bordas mais visíveis, separadores |

### Cores de Acento

| Token | Hex | Uso |
|---|---|---|
| `accent` | `#57F2BE` | Botão primário, links, ícones ativos, bolha do usuário, tab ativa |
| `accent-dark` | `#001C12` | Texto sobre fundo accent (botões primários) |
| `accent-muted` | `#57F2BE` (opacity 0.8) | Links secundários, textos de acento menos enfáticos |

### Cores de Texto

| Token | Hex | Uso |
|---|---|---|
| `text-primary` | `#FFFFFF` | Títulos, texto principal, valores monetários |
| `text-secondary` | `#B2B2B2` | Subtítulos, labels, descrições |
| `text-tertiary` | `#777777` | Placeholders, textos desabilitados, hints |
| `text-on-accent` | `#001C12` | Texto sobre fundo verde (botões, badges) |

### Cores Semânticas

| Token | Hex | Uso |
|---|---|---|
| `success` | `#8FF48E` | Confirmação de gasto, receita (V2), ícones positivos |
| `warning` | `#FFA235` | Alertas de vencimento, limite próximo, ícones de atenção |
| `error` | `#E61E32` | Erros, exclusão, fatura vencida |

### Cores de Categoria (sugestão inicial)

| Categoria | Cor | Hex |
|---|---|---|
| Alimentação | Laranja | `#FFA235` |
| Transporte | Azul | `#4DA6FF` |
| Moradia | Roxo | `#B07DFF` |
| Pets | Verde lima | `#8FF48E` |
| Lazer | Rosa | `#FF6B9D` |
| Saúde | Vermelho claro | `#FF6B6B` |
| Educação | Azul claro | `#6BC5FF` |
| Vestuário | Amarelo | `#FFD93D` |
| Outros | Cinza | `#888888` |

---

## 3. Tipografia

### Font Family

| Propriedade | Valor |
|---|---|
| **Fonte principal** | K2D |
| **Fallback** | System default (San Francisco / Roboto) |
| **Tipo** | Google Fonts, gratuita |

### Escala Tipográfica

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `heading-xl` | 28px | Bold (700) | Títulos de tela, valores destacados |
| `heading-lg` | 24px | SemiBold (600) | Títulos de seção (Dashboard, Config) |
| `heading-md` | 20px | SemiBold (600) | Subtítulos, nome de cartão |
| `heading-sm` | 18px | Medium (500) | Labels de seção, "Lançamentos" |
| `body-lg` | 16px | Regular (400) | Texto principal, conteúdo do chat |
| `body-md` | 14px | Regular (400) | Descrições, texto secundário |
| `body-sm` | 12px | Regular (400) | Captions, timestamps, metadata |
| `label` | 14px | Medium (500) | Labels de formulário, tabs |
| `label-sm` | 12px | Medium (500) | Badges, tags, labels pequenos |
| `button` | 14px | SemiBold (600) | Texto de botões |
| `button-lg` | 16px | SemiBold (600) | Texto de botões grandes (CTA) |

### Regras

- Valores monetários usam `heading-xl` ou `heading-lg` com peso Bold
- Formato monetário: `R$ 1.200,00` (sempre com R$, ponto de milhar, vírgula decimal)
- Datas: `01 de abril` (dia + mês por extenso) ou `01/04/2026` (formato curto)

---

## 4. Tokens de Design

### Espaçamento (Spacing)

| Token | Valor | Uso |
|---|---|---|
| `space-xxs` | 4px | Micro espaçamentos internos |
| `space-xs` | 8px | Gap entre ícone e texto, padding interno pequeno |
| `space-sm` | 12px | Gap entre elementos relacionados |
| `space-md` | 16px | Gap padrão entre cards, padding de cards |
| `space-lg` | 20px | Padding horizontal da tela |
| `space-xl` | 24px | Gap entre seções |
| `space-xxl` | 32px | Separação entre blocos grandes |

### Border Radius

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4px | Badges pequenos, indicadores |
| `radius-md` | 6px | Cards, botões, tags |
| `radius-lg` | 8px | Inputs, cards maiores |
| `radius-xl` | 12px | Modais, bottom sheets |
| `radius-round` | 22px | Avatares, botões redondos |
| `radius-full` | 9999px | Pílulas, chips |

### Tamanho de Componentes

| Componente | Altura | Observação |
|---|---|---|
| Botão primário | 40px | CTA principal |
| Botão secundário | 40px | Ações secundárias |
| Input | 42px | Campos de formulário |
| Tab horizontal | 32px | Tabs do dashboard e seletor |
| Bottom tab bar | 56px | Barra de navegação inferior |
| Card de lançamento | 95px | Card com ícone + descrição + valor |
| Card de categoria (grid) | 141px | Card de categoria no grid (3 colunas) |
| Chat input bar | 48px | Campo de digitação do chat |
| Chat bubble | auto | Altura dinâmica baseada no conteúdo |
| Card de confirmação | auto | Altura dinâmica, ~180-220px |

### Opacidade

| Token | Valor | Uso |
|---|---|---|
| `opacity-muted` | 0.8 | Textos e links secundários |
| `opacity-disabled` | 0.4 | Elementos desabilitados |
| `opacity-overlay` | 0.6 | Overlay de modais e bottom sheets |

---

## 5. Componentes Base

### 5.1 Botões

#### Botão Primário
- **Fundo:** `accent` (`#57F2BE`)
- **Texto:** `accent-dark` (`#001C12`), `button` (14px SemiBold)
- **Altura:** 40px
- **Border radius:** `radius-md` (6px)
- **Largura:** fill (100% do container) ou fit-content
- **Estado hover/press:** opacity 0.9
- **Estado disabled:** opacity 0.4

#### Botão Secundário
- **Fundo:** `surface` (`#161616`)
- **Texto:** `text-primary` (`#FFFFFF`), `button` (14px SemiBold)
- **Altura:** 40px
- **Border radius:** `radius-md` (6px)
- **Estado hover/press:** fundo `#1B1B1B`

#### Botão Danger
- **Fundo:** `error` (`#E61E32`)
- **Texto:** `#FFFFFF`, `button` (14px SemiBold)
- **Altura:** 40px
- **Border radius:** `radius-md` (6px)
- **Uso:** Exclusão de cartão, logout

#### Botão Ghost
- **Fundo:** transparente
- **Texto:** `accent` (`#57F2BE`), `button` (14px SemiBold)
- **Uso:** Links inline, "Ver todos", "Filtrar"

### 5.2 Inputs

#### Text Input
- **Fundo:** `surface-elevated` (`#1B1B1B`)
- **Borda:** `border-subtle` (`#2D2D2D`), 1px, `radius-lg` (8px)
- **Texto:** `text-primary` (`#FFFFFF`), `body-lg` (16px Regular)
- **Placeholder:** `text-tertiary` (`#777777`)
- **Altura:** 42px
- **Padding horizontal:** 16px
- **Estado focus:** borda `accent` (`#57F2BE`)
- **Estado erro:** borda `error` (`#E61E32`)

#### Chat Input
- **Fundo:** `surface-elevated` (`#1B1B1B`)
- **Borda:** `border-subtle` (`#2D2D2D`), 1px, `radius-full` (9999px)
- **Texto:** `text-primary`, `body-lg` (16px Regular)
- **Placeholder:** `text-tertiary`, "Digite seu gasto..."
- **Altura:** 48px
- **Ícone de enviar:** à direita, cor `accent`
- **Padding horizontal:** 20px

### 5.3 Cards

#### Card de Lançamento
- **Fundo:** `surface` (`#161616`)
- **Border radius:** `radius-md` (6px)
- **Padding:** 16px
- **Altura:** 95px
- **Layout interno:**
  - Esquerda: ícone da categoria (31x31, fundo `border` `#303030`, radius 3px)
  - Centro: label da categoria (`text-secondary`, `body-sm`) + descrição (`text-primary`, `body-md`) + valor (`text-primary`, `heading-sm`)
  - Direita (opcional): método de pagamento / data

#### Card de Categoria (Grid)
- **Fundo:** `surface` (`#161616`)
- **Border radius:** `radius-md` (6px)
- **Tamanho:** 128x141px (3 por linha com gap)
- **Layout interno:**
  - Topo: ícone (31x31, fundo `border`)
  - Centro/baixo: nome da categoria (`text-primary`, `body-sm`, multiline)

#### Card de Confirmação de Gasto (Chat)
- **Fundo:** `surface` (`#161616`)
- **Border radius:** `radius-lg` (8px)
- **Padding:** 16px
- **Largura:** ~80% da tela
- **Layout interno:**
  - Header: ícone atenção (`warning`) + "Confirmar gasto" (`text-secondary`, `body-sm`)
  - Corpo:
    - Descrição (`text-primary`, `heading-sm` Bold)
    - Valor (`text-primary`, `heading-lg` Bold)
    - Linha: Categoria → badge com cor da categoria
    - Linha: Método → texto (Crédito / Débito / Pix / Dinheiro)
    - Linha: Cartão → texto (se crédito)
    - Linha: Parcelas → texto "3x de R$ 100,00" (se houver)
  - Footer: botões "Editar" (ghost) + "Confirmar" (primário)

### 5.4 Chat Bubbles

#### Bolha do Usuário
- **Fundo:** `accent` (`#57F2BE`)
- **Texto:** `accent-dark` (`#001C12`), `body-lg` (16px Regular)
- **Border radius:** 16px (topo) / 4px (canto inferior direito)
- **Alinhamento:** direita
- **Max width:** 80% da tela
- **Padding:** 12px 16px

#### Bolha da IA
- **Fundo:** `surface` (`#161616`)
- **Texto:** `text-primary` (`#FFFFFF`), `body-lg` (16px Regular)
- **Border radius:** 16px (topo) / 4px (canto inferior esquerdo)
- **Alinhamento:** esquerda
- **Max width:** 80% da tela
- **Padding:** 12px 16px
- **Ícone:** pequeno ícone/avatar do FinChat à esquerda (opcional)

### 5.5 Tabs

#### Tab Horizontal (Dashboard)
- **Fundo inativo:** `surface` (`#161616`)
- **Fundo ativo:** transparente com borda inferior `accent`
- **Texto inativo:** `text-secondary` (`#B2B2B2`), `label` (14px Medium)
- **Texto ativo:** `accent` (`#57F2BE`), `label` (14px Medium)
- **Altura:** 32px
- **Indicador ativo:** linha 2px na borda inferior, cor `accent`

#### Seletor de Dia (inspirado no PayUp)
- **Fundo inativo:** `surface` (`#161616`), radius 6px
- **Fundo ativo:** transparente com borda `accent`
- **Texto inativo:** `text-primary`, `label-sm` (12px Medium)
- **Texto ativo:** `accent`, `label-sm` (12px Medium)
- **Tamanho de cada item:** ~47x31px

### 5.6 Seletor de Mês

- **Layout:** `< Abril 2026 >`
- **Setas:** ícones chevron esquerda/direita, cor `text-secondary`, 24x24
- **Texto:** `text-primary`, `heading-md` (20px SemiBold)
- **Posição:** header do Dashboard, centralizado
- **Interação:** tap nas setas avança/retrocede 1 mês

### 5.7 Bottom Tab Bar

- **Fundo:** `surface` (`#161616`)
- **Borda superior:** 1px `border-subtle` (`#2D2D2D`)
- **Altura:** 56px (+ safe area no iOS)
- **Tabs:** 3 itens distribuídos igualmente
- **Ícone inativo:** `text-tertiary` (`#777777`), 24x24
- **Ícone ativo:** `accent` (`#57F2BE`), 24x24
- **Label inativo:** `text-tertiary`, `label-sm` (12px)
- **Label ativo:** `accent`, `label-sm` (12px)

| Tab | Ícone | Label |
|---|---|---|
| Chat | `message-circle` (Lucide) | Chat |
| Dashboard | `bar-chart-3` (Lucide) | Dashboard |
| Config | `settings` (Lucide) | Config |

### 5.8 Barra de Limite do Cartão

- **Fundo:** `border` (`#303030`)
- **Preenchimento:** gradiente de `accent` até `warning` conforme porcentagem
- **Altura:** 8px
- **Border radius:** `radius-full`
- **Abaixo:** texto "R$ 1.200 de R$ 3.000" (`text-secondary`, `body-sm`)
- **Cores por faixa:**
  - 0-70%: `accent` (`#57F2BE`)
  - 70-90%: `warning` (`#FFA235`)
  - 90-100%: `error` (`#E61E32`)

### 5.9 Badge de Categoria

- **Fundo:** cor da categoria (com opacity 0.15)
- **Texto:** cor da categoria (full opacity), `label-sm` (12px Medium)
- **Border radius:** `radius-full`
- **Padding:** 4px 10px
- **Altura:** auto (fit content)

---

## 6. Navegacao

### Estrutura de Navegacao

```
App
├── Auth (stack)
│   ├── Login
│   └── Cadastro
│
└── Main (bottom tabs)
    ├── Chat (tab 1 - principal)
    │   ├── Chat vazio (estado inicial)
    │   └── Chat com conversa
    │
    ├── Dashboard (tab 2)
    │   ├── Seletor de mês (header)
    │   └── Tabs horizontais
    │       ├── Resumo
    │       ├── Faturas
    │       ├── Gastos Diretos
    │       ├── Extrato
    │       └── Parcelas
    │
    └── Config (tab 3)
        ├── Lista principal
        ├── Cartões (sub-tela)
        │   ├── Lista de cartões
        │   └── Adicionar/Editar cartão
        ├── Categorias (sub-tela)
        │   ├── Lista de categorias
        │   └── Dicionário de associações
        ├── Perfil (sub-tela)
        │   ├── Dados pessoais
        │   └── Alterar senha
        └── Logout
```

### Regras de Navegação

- O **Chat** é a tela inicial ao abrir o app (após login)
- Bottom tab bar visível em todas as telas do Main
- Sub-telas de Config usam navegação stack (push/pop com header e botão voltar)
- Dashboard mantém o estado da tab selecionada e mês ao trocar de tab principal
- Login/Cadastro não tem bottom tab bar

---

## 7. Telas V1

### 7.1 Login

| Elemento | Especificação |
|---|---|
| **Background** | `background` (`#0F110E`) |
| **Logo** | Ícone FinChat + nome, centralizado no topo |
| **Campo email** | Input padrão, placeholder "Email" |
| **Campo senha** | Input padrão, placeholder "Senha", ícone olho para mostrar/ocultar |
| **Botão "Entrar"** | Botão primário, largura full |
| **Link "Criar conta"** | Botão ghost, abaixo do botão entrar |
| **Espaçamento** | Campos com gap `space-md` (16px), padding tela `space-lg` (20px) |

### 7.2 Cadastro

| Elemento | Especificação |
|---|---|
| **Header** | Botão voltar (seta) + título "Criar conta" |
| **Campo nome** | Input padrão, placeholder "Nome" |
| **Campo email** | Input padrão, placeholder "Email" |
| **Campo senha** | Input padrão, placeholder "Senha", ícone olho |
| **Campo confirmar senha** | Input padrão, placeholder "Confirmar senha", ícone olho |
| **Botão "Cadastrar"** | Botão primário, largura full |
| **Link "Já tem conta?"** | Botão ghost, volta para Login |

### 7.3 Chat (Estado Vazio)

| Elemento | Especificação |
|---|---|
| **Header** | Logo FinChat (esquerda) + ícone notificação (direita) |
| **Área do chat** | Centralizado verticalmente |
| **Mensagem de boas-vindas** | Bolha da IA: "Olá! Sou seu assistente financeiro. Registre seus gastos conversando comigo!" |
| **Dicas de uso** | Cards ou texto abaixo da boas-vindas com exemplos: |
| | "Digite algo como:" |
| | `50 almoço pix` |
| | `300 ração 3x nubank` |
| | `1200 aluguel débito` |
| **Input** | Chat input fixo no bottom, placeholder "Digite seu gasto..." |
| **Bottom tab bar** | Chat (ativo), Dashboard, Config |

### 7.4 Chat (Com Conversa)

| Elemento | Especificação |
|---|---|
| **Header** | Logo FinChat (esquerda) + ícone notificação (direita) |
| **Área do chat** | ScrollView vertical, mensagens mais recentes embaixo |
| **Bolha do usuário** | Ex: "300 ração 3x nubank" — alinhada à direita, fundo `accent` |
| **Bolha da IA** | Resposta interpretada — alinhada à esquerda, fundo `surface` |
| **Card de confirmação** | Abaixo da bolha da IA, com dados do gasto e botões Confirmar/Editar |
| **Feedback pós-confirmação** | Bolha da IA: "Gasto registrado! Ração - R$ 300,00 (3x de R$ 100,00 no Nubank)" com ícone check `success` |
| **Pergunta da IA** | Quando falta info: "Em qual cartão?" — bolha normal da IA |
| **Resposta do usuário** | "nubank" — bolha normal do usuário |
| **Input** | Chat input fixo no bottom |
| **Timestamp** | Data/hora centralizada entre grupos de mensagens, `text-tertiary`, `body-sm` |

### 7.5 Dashboard - Resumo

| Elemento | Especificação |
|---|---|
| **Header** | "Dashboard" (título) |
| **Seletor de mês** | `< Abril 2026 >` centralizado |
| **Tabs horizontais** | Resumo (ativo) | Faturas | Gastos Diretos | Extrato | Parcelas |
| **Card total do mês** | Card grande com valor total (`heading-xl`, Bold), fundo `surface` |
| **Comparação** | Abaixo do total: "+12% vs. mês anterior" (cor `warning` se subiu, `success` se desceu) |
| **Gráfico por categoria** | Barras horizontais ou pizza, com cor de cada categoria |
| **Lista resumida** | Top 5 categorias com valor e porcentagem |

### 7.6 Dashboard - Faturas

| Elemento | Especificação |
|---|---|
| **Seletor de mês** | Mesmo do resumo (estado persistido) |
| **Tabs** | Faturas (ativo) |
| **Card por cartão** | Nome do cartão + bandeira, fundo `surface` |
| | Valor da fatura: `heading-md` Bold |
| | Barra de limite (componente 5.8) |
| | Data de vencimento: `text-secondary`, `body-sm` |
| | Alerta se próximo do vencimento: badge `warning` |
| **Lista de gastos do cartão** | Expandível: gastos que caem nesse ciclo de fatura |
| **Parcelas do cartão** | Sub-lista com parcelas ativas vinculadas |

### 7.7 Dashboard - Gastos Diretos

| Elemento | Especificação |
|---|---|
| **Seletor de mês** | Mesmo |
| **Tabs** | Gastos Diretos (ativo) |
| **Agrupamento** | Por data (ex: "01 de abril", "02 de abril") |
| **Dentro de cada data** | Lista de cards de lançamento (componente 5.3) |
| **Subtotal por data** | Valor somado dos gastos daquele dia, `text-secondary` |
| **Filtro por método** | Chip/toggle no topo: Todos | Débito | Pix | Dinheiro |

### 7.8 Dashboard - Extrato

| Elemento | Especificação |
|---|---|
| **Seletor de mês** | Mesmo |
| **Tabs** | Extrato (ativo) |
| **Barra de filtros** | Botão "Filtrar" com ícone funnel (`text-primary`) |
| **Filtros disponíveis** | Bottom sheet com: Categoria, Método, Cartão, Período, Valor |
| **Lista** | Cards de lançamento em ordem cronológica (mais recente primeiro) |
| **Cada card** | Ícone categoria + descrição + valor + método + data |
| **Indicador de método** | Badge pequeno (Crédito/Débito/Pix/Dinheiro) |

### 7.9 Dashboard - Parcelas

| Elemento | Especificação |
|---|---|
| **Seletor de mês** | Mesmo |
| **Tabs** | Parcelas (ativo) |
| **Card de parcela** | Descrição + valor total + progresso |
| | Barra de progresso: "3 de 10 pagas" com preenchimento proporcional |
| | Valor da parcela mensal: `heading-sm` |
| | Cartão vinculado: badge com nome do cartão |
| | Próximo vencimento: data em `text-secondary` |
| **Resumo no topo** | Total comprometido com parcelas no mês: `heading-lg` Bold |

### 7.10 Config (Lista Principal)

| Elemento | Especificação |
|---|---|
| **Header** | "Configurações" (`heading-lg`) |
| **Layout** | Lista vertical de opções, cada item é um row clicável |
| **Item de lista** | Ícone (24x24, `text-secondary`) + Label (`body-lg`) + chevron right |
| **Itens:** | |
| | Cartões de Crédito — ícone `credit-card` |
| | Categorias — ícone `tag` |
| | Perfil — ícone `user` |
| **Separador** | Linha 1px `border-subtle` entre itens |
| **Logout** | Botão no final da lista, cor `error`, ícone `log-out` |

### 7.11 Config - Cartões

| Elemento | Especificação |
|---|---|
| **Header** | Botão voltar + "Cartões de Crédito" |
| **Lista de cartões** | Cards com: nome, bandeira/ícone, últimos 4 dígitos (opcional), dia de fechamento, dia de vencimento, limite |
| **Botão adicionar** | Botão primário "Adicionar cartão" no bottom |
| **Tela de adicionar/editar** | Formulário com: Nome do cartão (input), Dia de fechamento (input numérico), Dia de vencimento (input numérico), Limite (input monetário) |
| **Ação de deletar** | Botão danger "Remover cartão" (com confirmação) |

### 7.12 Config - Categorias

| Elemento | Especificação |
|---|---|
| **Header** | Botão voltar + "Categorias" |
| **Lista de categorias** | Cada item: badge colorido + nome + quantidade de associações |
| **Dicionário de associações** | Ao tocar numa categoria, expande e mostra as associações (ex: "ração", "veterinário", "petshop" → Pets) |
| **Adicionar categoria** | Botão ghost "+ Nova categoria" |
| **Editar categoria** | Tap no item → editar nome e cor |

### 7.13 Config - Perfil

| Elemento | Especificação |
|---|---|
| **Header** | Botão voltar + "Perfil" |
| **Campos** | Nome (input, editável), Email (input, read-only ou editável) |
| **Seção "Alterar Senha"** | Senha atual (input), Nova senha (input), Confirmar nova senha (input) |
| **Botão salvar** | Botão primário "Salvar alterações" |

---

## 8. Padrões de Interação do Chat

### 8.1 Fluxo de Registro de Gasto

```
Usuário envia: "300 ração 3x nubank"
                                          ┌──────────────────────┐
                                          │  300 ração 3x nubank │ ← bolha do usuário (direita, verde)
                                          └──────────────────────┘

┌─────────────────────────────┐
│ Entendi! Confirma esse gasto│ ← bolha da IA (esquerda, cinza)
└─────────────────────────────┘

┌─────────────────────────────┐
│  CONFIRMAR GASTO            │ ← card de confirmação
│                             │
│  Descrição: Ração           │
│  Valor: R$ 300,00           │
│  Categoria: Pets            │
│  Método: Crédito            │
│  Cartão: Nubank             │
│  Parcelas: 3x de R$ 100,00 │
│                             │
│  [Editar]    [Confirmar ✓]  │
└─────────────────────────────┘
```

### 8.2 Fluxo de Edição (via texto)

```
Usuário toca em "Editar"

┌─────────────────────────────┐
│ O que deseja alterar?       │ ← bolha da IA
│ Responda em texto.          │
└─────────────────────────────┘

                                          ┌──────────────────────┐
                                          │  muda pra débito     │ ← bolha do usuário
                                          └──────────────────────┘

┌─────────────────────────────┐
│ Certo! Atualizei para       │ ← bolha da IA
│ débito. Confirma?           │
└─────────────────────────────┘

┌─────────────────────────────┐
│  CONFIRMAR GASTO            │ ← card atualizado
│  ...                        │
│  Método: Débito  ← mudou   │
│  Cartão: —       ← removido│
│  ...                        │
│  [Editar]    [Confirmar ✓]  │
└─────────────────────────────┘
```

### 8.3 Fluxo de Pergunta da IA

```
Usuário envia: "300 ração 3x"
                                          ┌──────────────────────┐
                                          │  300 ração 3x        │
                                          └──────────────────────┘

┌─────────────────────────────┐
│ Em qual cartão deseja       │ ← IA pergunta (bolha normal)
│ registrar?                  │
│                             │
│ Seus cartões:               │
│ • Nubank                    │
│ • PicPay                    │
└─────────────────────────────┘

                                          ┌──────────────────────┐
                                          │  nubank              │ ← usuário responde
                                          └──────────────────────┘

┌─────────────────────────────┐
│  CONFIRMAR GASTO            │ ← card com dados completos
│  ...                        │
└─────────────────────────────┘
```

### 8.4 Feedback de Confirmação

```
Usuário toca em "Confirmar ✓"

┌─────────────────────────────┐
│ ✅ Gasto registrado!        │ ← bolha da IA com ícone success
│                             │
│ Ração — R$ 300,00           │
│ 3x de R$ 100,00 no Nubank  │
│ Categoria: Pets             │
└─────────────────────────────┘
```

### 8.5 Estado de Loading

- Enquanto a IA processa: indicador de "digitando..." (3 dots animados) na posição da bolha da IA
- Fundo: `surface`, padding igual à bolha
- Animação: pulso nos dots

### 8.6 Estado de Erro

```
┌─────────────────────────────┐
│ ⚠️ Não consegui entender.   │ ← bolha da IA com ícone warning
│ Tente algo como:            │
│ "50 almoço pix"             │
│ "300 ração 3x nubank"       │
└─────────────────────────────┘
```

---

## 9. Roadmap de Design

### V1 - MVP

- [x] Dark theme definido
- [ ] 13 telas especificadas (seção 7)
- [ ] Componentes base (seção 5)
- [ ] Paleta de cores completa
- [ ] Tipografia K2D com escala
- [ ] Ícones: Lucide Icons
- [ ] Bottom tabs: 3 tabs (Chat, Dashboard, Config)
- [ ] Chat como tela principal
- [ ] Cards de confirmação inline

### V2 - Melhorias

- [ ] Light theme (toggle em Config)
- [ ] Cadastro de cartão via chat ("adicionar cartão nubank dia 10")
- [ ] Seletor rápido de mês/ano (tap no texto "Abril 2026" abre picker)
- [ ] Animações de transição entre telas
- [ ] Animação de confirmação de gasto (check animado)
- [ ] Gráfico de evolução mensal (linha) no Dashboard
- [ ] Notificações push (vencimento de fatura, lembrete de parcela)

### V3 - Polish

- [ ] Onboarding com tutorial interativo (primeira vez)
- [ ] Temas personalizáveis (cor de acento customizável)
- [ ] Modo compacto do dashboard
- [ ] Widgets para tela inicial do celular
- [ ] Exportação de relatórios (PDF/CSV) com design formatado
