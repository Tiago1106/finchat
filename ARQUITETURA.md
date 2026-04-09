# FinChat - Arquitetura Técnica

> Documento técnico com stack, arquitetura, estrutura de pastas e setup de infraestrutura.
> Para identidade visual, tokens e especificação de telas, consulte [DESIGN.md](./DESIGN.md).

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Versão / Observação |
|---|---|---|
| **Mobile** | Expo (React Native) + TypeScript | SDK mais recente |
| **UI/Design System** | Tamagui | Compilação otimizada, tokens de design, componentes prontos |
| **Estado Global** | Zustand | Leve, sem boilerplate, seletores com re-render otimizado |
| **API + Cache** | TanStack React Query | Cache, refetch, loading states, optimistic updates |
| **Backend** | NestJS + TypeScript | Node.js 20+ |
| **Banco de Dados** | PostgreSQL | 16+ via Docker |
| **ORM** | Drizzle ORM | Com drizzle-kit para migrations |
| **Autenticação** | JWT próprio | bcrypt (hash) + jsonwebtoken (tokens) |
| **IA** | Ollama | Modelo a definir nos testes (Llama 3.2 3B, Phi-3 Mini, etc.) |
| **Infra Local** | Docker Compose | Postgres + Ollama |
| **Documentação API** | Swagger (@nestjs/swagger) | Auto-gerada, interativa, com exemplos prontos |

---

## 2. Diagrama de Arquitetura

```
┌─────────────────┐         ┌──────────────────────────────────┐
│                 │  REST   │          NestJS API               │
│   Expo App      │◄───────►│                                  │
│   (Mobile)      │  JSON   │  ┌────────────┐ ┌─────────────┐ │
│                 │         │  │ Auth Module │ │ Chat Module │ │
└─────────────────┘         │  └────────────┘ └──────┬──────┘ │
                            │  ┌────────────┐        │        │
                            │  │ Expense    │        │        │
                            │  │ Module     │        │        │
                            │  └─────┬──────┘        │        │
                            │        │               │        │
                            │  ┌─────▼───────────────▼──────┐ │
                            │  │       Drizzle ORM          │ │
                            │  └─────┬──────────────────────┘ │
                            └────────┼────────────┬───────────┘
                                     │            │
                              ┌──────▼──────┐ ┌───▼──────────┐
                              │ PostgreSQL  │ │   Ollama     │
                              │ (Docker)    │ │   (Docker)   │
                              └─────────────┘ └──────────────┘
```

### Fluxo de uma mensagem

```
1. [Expo] Usuário digita "300 ração 3x nubank"
       │
       ▼
2. [NestJS - ChatModule] Recebe mensagem via POST /chat/message
       │
       ▼
3. [NestJS - ChatModule] Salva mensagem na conversa (role: user)
       │
       ▼
4. [NestJS - ExpenseModule] Consulta category_mapping do usuário
       │
       ├── Encontrou "ração" → Pets ──────────────────┐
       │                                               │
       └── Não encontrou → Consulta Ollama ───────────►│
                                                       │
5. [NestJS - ExpenseModule] Monta interpretação ◄──────┘
       │
       ├── Valor: R$300,00
       ├── Descrição: Ração
       ├── Parcelas: 3x (R$100,00)
       ├── Categoria: Pets
       ├── Método: Crédito (assume por ter 3x)
       ├── Cartão: Nubank (identificado na mensagem)
       └── billing_month: calculado (date + closing_day)
       │
       ▼
6. [NestJS - ChatModule] Salva mensagem de resposta (role: assistant)
       │
       ▼
7. [Expo] Exibe interpretação e botões Confirmar / Corrigir
       │
       ▼
8. [NestJS - ExpenseModule] Usuário confirma → Salva lançamento(s) no banco
       │
       └── Se parcelado: gera N registros com installment_group_id
```

---

## 3. Módulos do Backend (NestJS)

### 3.1 AuthModule

Responsável por autenticação e gerenciamento de usuários.

| Endpoint | Método | Descrição |
|---|---|---|
| `/auth/register` | POST | Cadastro de novo usuário |
| `/auth/login` | POST | Login, retorna access_token + refresh_token |
| `/auth/refresh` | POST | Renova access_token usando refresh_token |
| `/auth/me` | GET | Retorna dados do usuário autenticado |

**JWT Strategy:**
- **Access Token:** curta duração (~15min), usado em todas as requisições
- **Refresh Token:** longa duração (~7 dias), usado apenas para renovar o access token
- Senhas hasheadas com **bcrypt** (salt rounds: 10)

### 3.2 ChatModule

Responsável pelo chat e interpretação de mensagens.

| Endpoint | Método | Descrição |
|---|---|---|
| `/chat/conversations` | GET | Lista conversas do usuário |
| `/chat/conversations/:id` | GET | Retorna mensagens de uma conversa |
| `/chat/message` | POST | Envia mensagem e recebe interpretação da IA |
| `/chat/confirm` | POST | Confirma o lançamento sugerido pela IA |
| `/chat/correct` | POST | Corrige a interpretação da IA |

### 3.3 ExpenseModule

Responsável pelo CRUD de lançamentos e lógica de parcelas.

| Endpoint | Método | Descrição |
|---|---|---|
| `/expenses` | GET | Lista lançamentos (com filtros: categoria, método, cartão, período, valor) |
| `/expenses/:id` | GET | Detalhes de um lançamento |
| `/expenses/:id` | PUT | Edita um lançamento |
| `/expenses/:id` | DELETE | Exclui um lançamento |
| `/expenses/installments/:groupId` | GET | Lista parcelas de uma compra |

### 3.4 CardModule

Responsável pelo CRUD de cartões de crédito.

| Endpoint | Método | Descrição |
|---|---|---|
| `/cards` | GET | Lista cartões do usuário |
| `/cards` | POST | Cadastra novo cartão (apelido, fechamento, vencimento, limite) |
| `/cards/:id` | PUT | Edita um cartão |
| `/cards/:id` | DELETE | Exclui um cartão |

### 3.5 CategoryModule

Responsável pelo CRUD de categorias.

| Endpoint | Método | Descrição |
|---|---|---|
| `/categories` | GET | Lista categorias (globais + do usuário) |
| `/categories` | POST | Cria nova categoria (do usuário) |
| `/categories/:id` | PUT | Edita categoria do usuário |
| `/categories/:id` | DELETE | Exclui categoria do usuário |

### 3.6 DashboardModule

Responsável por agregar dados para o dashboard.

| Endpoint | Método | Descrição |
|---|---|---|
| `/dashboard/summary/:month` | GET | Resumo do mês (total, comparação com anterior) |
| `/dashboard/by-category/:month` | GET | Gastos por categoria no mês |
| `/dashboard/invoices/:month` | GET | Faturas de crédito agrupadas por cartão |
| `/dashboard/direct-expenses/:month` | GET | Gastos diretos (débito/pix/dinheiro) no mês |
| `/dashboard/timeline` | GET | Evolução mensal dos gastos (gráfico de linha) |
| `/dashboard/active-installments` | GET | Parcelas ativas |

### 3.7 OllamaModule

Serviço que se comunica com a API do Ollama para interpretar mensagens.

| Responsabilidade | Descrição |
|---|---|
| `interpretMessage(text)` | Envia texto para o Ollama e recebe JSON estruturado com valor, descrição, parcelas, método, cartão |
| Prompt engineering | Template de system prompt que instrui o modelo a retornar JSON padronizado |
| Fallback | Se Ollama não responder, tenta parsing com regex simples |

---

## 4. Documentação da API (Swagger)

### Requisitos

- Todos os endpoints devem ser documentados com **Swagger** via `@nestjs/swagger`
- A documentação fica disponível em **`/api/docs`** no backend
- Todos os DTOs (request/response) devem ter **exemplos prontos** para facilitar testes diretos no Swagger sem precisar digitar manualmente
- Usar os decorators `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty` em todos os controllers e DTOs

### Configuração

O Swagger deve ser configurado no `main.ts` com:

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('FinChat API')
  .setDescription('API do FinChat - Controle financeiro via chat com IA')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Exemplos Obrigatórios por Módulo

Cada DTO deve ter `@ApiProperty({ example: ... })` para que o Swagger preencha automaticamente ao clicar em "Try it out".

#### 4.1 AuthModule — Exemplos

**POST /auth/register**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**POST /auth/login**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (login/register):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

#### 4.2 ChatModule — Exemplos

**POST /chat/message**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "300 ração 3x nubank"
}
```

**Response (interpretação da IA):**
```json
{
  "message_id": "550e8400-e29b-41d4-a716-446655440010",
  "interpretation": {
    "description": "Ração",
    "total_amount": 300.00,
    "installments": 3,
    "installment_amount": 100.00,
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Pets"
    },
    "payment_method": "credit",
    "card": {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "name": "Nubank"
    },
    "billing_month": "2026-04",
    "date": "2026-04-07"
  },
  "confirmation_required": true
}
```

**POST /chat/confirm**
```json
{
  "message_id": "550e8400-e29b-41d4-a716-446655440010",
  "interpretation_accepted": true
}
```

**POST /chat/correct**
```json
{
  "message_id": "550e8400-e29b-41d4-a716-446655440010",
  "corrections": {
    "category_id": "550e8400-e29b-41d4-a716-446655440021",
    "payment_method": "debit",
    "card_id": null
  }
}
```

#### 4.3 ExpenseModule — Exemplos

**GET /expenses?category_id=...&payment_method=credit&month=2026-04**

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "description": "Ração",
      "total_amount": 300.00,
      "installment_amount": 100.00,
      "installments": 3,
      "installment_number": 1,
      "installment_group_id": "550e8400-e29b-41d4-a716-446655440050",
      "category": { "id": "...", "name": "Pets", "icon": "paw" },
      "card": { "id": "...", "name": "Nubank" },
      "payment_method": "credit",
      "date": "2026-04-07",
      "billing_month": "2026-04",
      "confirmed": true,
      "created_at": "2026-04-07T20:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

**PUT /expenses/:id**
```json
{
  "description": "Ração Premium",
  "total_amount": 350.00,
  "category_id": "550e8400-e29b-41d4-a716-446655440020",
  "payment_method": "credit",
  "card_id": "550e8400-e29b-41d4-a716-446655440030",
  "date": "2026-04-07"
}
```

#### 4.4 CardModule — Exemplos

**POST /cards**
```json
{
  "name": "Nubank",
  "closing_day": 3,
  "due_day": 10,
  "credit_limit": 5000.00
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440030",
  "name": "Nubank",
  "closing_day": 3,
  "due_day": 10,
  "credit_limit": 5000.00,
  "created_at": "2026-04-07T20:00:00Z"
}
```

**PUT /cards/:id**
```json
{
  "name": "Nubank Ultravioleta",
  "closing_day": 3,
  "due_day": 10,
  "credit_limit": 8000.00
}
```

#### 4.5 CategoryModule — Exemplos

**POST /categories**
```json
{
  "name": "Assinaturas",
  "icon": "repeat"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440060",
  "name": "Assinaturas",
  "icon": "repeat",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-04-07T20:00:00Z"
}
```

#### 4.6 DashboardModule — Exemplos

**GET /dashboard/summary/2026-04**

**Response:**
```json
{
  "month": "2026-04",
  "total": 2850.00,
  "credit_total": 2100.00,
  "direct_total": 750.00,
  "previous_month_total": 3200.00,
  "variation_percentage": -10.94
}
```

**GET /dashboard/by-category/2026-04**

**Response:**
```json
{
  "month": "2026-04",
  "categories": [
    { "name": "Alimentação", "icon": "utensils", "total": 850.00, "percentage": 29.82 },
    { "name": "Transporte", "icon": "car", "total": 600.00, "percentage": 21.05 },
    { "name": "Pets", "icon": "paw", "total": 300.00, "percentage": 10.53 },
    { "name": "Moradia", "icon": "home", "total": 1100.00, "percentage": 38.60 }
  ]
}
```

**GET /dashboard/invoices/2026-04**

**Response:**
```json
{
  "month": "2026-04",
  "invoices": [
    {
      "card": { "id": "...", "name": "Nubank", "closing_day": 3, "due_day": 10, "credit_limit": 5000.00 },
      "total": 1500.00,
      "limit_used_percentage": 30.00,
      "due_date": "2026-04-10",
      "expenses": [
        { "description": "Ração", "installment_amount": 100.00, "installment_number": 1, "installments": 3 },
        { "description": "Mercado", "installment_amount": 400.00, "installment_number": 1, "installments": 1 }
      ]
    },
    {
      "card": { "id": "...", "name": "PicPay", "closing_day": 15, "due_day": 22, "credit_limit": 3000.00 },
      "total": 600.00,
      "limit_used_percentage": 20.00,
      "due_date": "2026-04-22",
      "expenses": [
        { "description": "Curso Online", "installment_amount": 200.00, "installment_number": 2, "installments": 6 }
      ]
    }
  ]
}
```

**GET /dashboard/active-installments**

**Response:**
```json
{
  "installments": [
    {
      "installment_group_id": "550e8400-e29b-41d4-a716-446655440050",
      "description": "Ração",
      "total_amount": 300.00,
      "installments": 3,
      "paid": 1,
      "remaining": 2,
      "installment_amount": 100.00,
      "card": { "name": "Nubank" },
      "next_billing_month": "2026-05"
    }
  ]
}
```

### Regra de Implementação

> **Toda nova rota ou DTO criado DEVE ter exemplos no Swagger.** Isso é obrigatório para que qualquer desenvolvedor consiga testar a API direto no navegador sem precisar montar payloads manualmente.

---

## 5. Estrutura de Pastas

```
finchat/
├── docs/
│   ├── REGRAS_DE_NEGOCIO.md
│   └── ARQUITETURA.md
│
├── backend/                          # NestJS API
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── chat.service.ts
│   │   │
│   │   ├── expense/
│   │   │   ├── expense.module.ts
│   │   │   ├── expense.controller.ts
│   │   │   └── expense.service.ts
│   │   │
│   │   ├── card/
│   │   │   ├── card.module.ts
│   │   │   ├── card.controller.ts
│   │   │   └── card.service.ts
│   │   │
│   │   ├── category/
│   │   │   ├── category.module.ts
│   │   │   ├── category.controller.ts
│   │   │   └── category.service.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── dashboard.service.ts
│   │   │
│   │   ├── ollama/
│   │   │   ├── ollama.module.ts
│   │   │   ├── ollama.service.ts
│   │   │   └── prompts/
│   │   │       └── interpret-expense.prompt.ts
│   │   │
│   │   └── database/
│   │       ├── database.module.ts
│   │       ├── schema.ts              # Drizzle schema (todas as tabelas)
│   │       └── migrations/            # Drizzle migrations
│   │
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── mobile/                           # Expo (React Native)
│   ├── app/                          # Expo Router (file-based routing)
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── chat.tsx              # Tela principal do chat
│   │   │   ├── dashboard.tsx         # Dashboard com gráficos
│   │   │   ├── cards.tsx             # Gerenciar cartões
│   │   │   └── settings.tsx          # Configurações do usuário
│   │   └── _layout.tsx
│   │
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   ├── ExpenseConfirmCard.tsx
│   │   ├── DashboardSummary.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── InvoiceCard.tsx
│   │   └── InstallmentList.tsx
│   │
│   ├── services/
│   │   ├── api.ts                    # Axios/fetch configurado com JWT
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── expense.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── stores/
│   │   └── auth.store.ts             # Estado global (Zustand ou Context)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   └── .env
│
├── docker-compose.yml
└── .gitignore
```

---

## 6. Banco de Dados (Drizzle Schema)

### Tabelas

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  users   │────►│   expenses   │◄────│  cards   │
└──────────┘     └──────┬───────┘     └──────────┘
     │                  │
     │           ┌──────▼───────┐
     │           │  categories  │
     │           └──────────────┘
     │
     ├──────────►┌──────────────────┐
     │           │ category_mappings│
     │           └──────────────────┘
     │
     ├──────────►┌──────────────────┐     ┌──────────┐
     │           │  conversations   │────►│ messages │
     │           └──────────────────┘     └──────────┘
```

### Relacionamentos

| Tabela | Relacionamento |
|---|---|
| `users` → `expenses` | 1:N (um usuário tem muitos lançamentos) |
| `users` → `cards` | 1:N (um usuário tem muitos cartões) |
| `users` → `conversations` | 1:N (um usuário tem muitas conversas) |
| `users` → `category_mappings` | 1:N (um usuário tem muitas associações) |
| `cards` → `expenses` | 1:N (um cartão tem muitos lançamentos) |
| `categories` → `expenses` | 1:N (uma categoria tem muitos lançamentos) |
| `categories` → `category_mappings` | 1:N (uma categoria tem muitas associações) |
| `conversations` → `messages` | 1:N (uma conversa tem muitas mensagens) |
| `expenses` → `messages` | 1:1 (um lançamento pode ter uma mensagem que o gerou) |
| `expenses` → `expenses` | N:N via `installment_group_id` (parcelas da mesma compra) |

---

## 7. Docker Compose

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: finchat-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: finchat
      POSTGRES_PASSWORD: finchat_dev
      POSTGRES_DB: finchat
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama:latest
    container_name: finchat-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # Para GPU NVIDIA, descomentar:
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

volumes:
  postgres_data:
  ollama_data:
```

### Comandos de Setup

```bash
# 1. Subir infraestrutura
docker compose up -d

# 2. Baixar modelo no Ollama (primeira vez)
docker exec -it finchat-ollama ollama pull llama3.2:3b

# 3. Backend
cd backend
npm install
npm run db:generate   # Gera migrations do Drizzle
npm run db:migrate    # Aplica migrations
npm run start:dev     # Inicia NestJS em dev

# 4. Mobile
cd mobile
npm install
npx expo start        # Inicia Expo dev server
```

---

## 8. Variáveis de Ambiente

### Backend (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DATABASE_URL=postgresql://finchat:finchat_dev@localhost:5432/finchat

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=sua-chave-refresh-aqui
JWT_REFRESH_EXPIRES_IN=7d

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Mobile (.env)

```env
API_BASE_URL=http://localhost:3000
```

---

## 9. Decisões Técnicas e Justificativas

| Decisão | Justificativa |
|---|---|
| **Expo (React Native)** | App mobile nativo, mais prático no dia a dia que web para registro rápido de gastos |
| **Tamagui** | Design system otimizado para React Native/Expo, compila estilos em build time, tokens/temas nativos, componentes prontos |
| **Zustand** | Estado global leve, sem boilerplate, seletores granulares evitam re-renders desnecessários, persist middleware para offline |
| **TanStack React Query** | Gerenciamento de chamadas API com cache inteligente, retry, loading/error states, evita `useEffect` manual |
| **NestJS** | Arquitetura modular robusta, TypeScript nativo, bom para APIs com lógica de negócio complexa |
| **PostgreSQL** | Banco relacional ideal para dados financeiros, suporta consultas complexas (agregações, joins) |
| **Drizzle ORM** | Leve, TypeScript-first, migrations simples, boa DX |
| **JWT próprio** | Controle total sobre auth, sem dependência de serviço externo, zero custo |
| **Ollama local** | Zero custo, privacidade dos dados financeiros, migrável para API paga no futuro |
| **Docker Compose** | Postgres + Ollama com um comando, ambiente reprodutível |
| **billing_month salvo** | Evita recalcular ciclo de fatura em cada query do dashboard, performance melhor |
| **category_mapping** | Reduz chamadas ao Ollama, respostas mais rápidas após primeiros usos |

---

## 10. Estratégia de Migração para Produção

Quando o app for para produção, as mudanças necessárias são mínimas:

| Componente | Dev (zero custo) | Produção |
|---|---|---|
| **Postgres** | Docker local | Supabase, Neon ou VPS com Docker |
| **Ollama** | Docker local | VPS com GPU, ou migrar para OpenAI/Groq API |
| **Backend** | `npm run start:dev` | Railway, Render, ou VPS com Docker |
| **Mobile** | Expo Go | Build nativo via EAS Build (Expo) → publicar nas lojas |

> A arquitetura foi desenhada para que **nenhuma mudança de código** seja necessária ao migrar — apenas variáveis de ambiente.
