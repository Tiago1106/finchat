# FinChat - Regras para Agentes e Operações

> Manual operacional para IAs e desenvolvedores trabalhando no projeto.
> Contém regras de git, código, documentação e lembretes importantes.

---

## 1. Regras de Git

### Commits

- **Formato:** Conventional Commits com escopo
  - `feat(backend): adicionar endpoint de login`
  - `feat(mobile): criar tela de chat`
  - `fix(backend): corrigir cálculo de billing_month`
  - `docs: atualizar REGRAS_DE_NEGOCIO.md`
  - `refactor(backend): extrair lógica de parcelas para service`
  - `chore: atualizar dependências`
  - `style(mobile): ajustar padding do card de confirmação`
  - `test(backend): adicionar testes do módulo auth`
- **Escopos válidos:** `backend`, `mobile`, `docs`, `infra`, `config`
- **Idioma:** descrição em português
- **Sempre fazer push após commit**
- **Commits pequenos e focados:** cada commit deve conter o mínimo de arquivos possível, agrupando por contexto (ex: um commit por módulo, não vários módulos juntos). PRs devem ser enxutos e fáceis de revisar
- Nunca commitar: `.env`, credenciais, chaves, `node_modules/`, arquivos de build

### Branches

- **`main`** — branch de produção, código estável e testado
- **`dev`** — branch de desenvolvimento, recebe PRs de features
- **Feature branches:** `feat/nome-da-feature` (ex: `feat/auth-module`, `feat/chat-screen`)
- **Fix branches:** `fix/nome-do-fix` (ex: `fix/billing-month-calc`)

### Fluxo de trabalho

```
feat/nome-da-feature → PR → dev (testes) → PR → main (produção)
```

1. Criar branch a partir de `dev`: `git checkout -b feat/nome-da-feature`
2. Desenvolver e commitar
3. Push e abrir PR para `dev`
4. Testes passando em `dev` → abrir PR para `main`
5. Merge em `main`

> **Fase 1 (setup):** tudo direto na `main`. Branches a partir da Fase 2.

---

## 2. Regras de Código

### Geral

- Todo código em **TypeScript** (backend e mobile)
- Sem `any` — tipar tudo explicitamente
- Sem `console.log` em produção — usar logger (NestJS Logger no backend)

### Convenções de Nomenclatura

| Contexto | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `credit-cards.service.ts` |
| Variáveis / Funções | camelCase | `getBillingMonth()` |
| Classes / Tipos / Interfaces | PascalCase | `CreateExpenseDto` |
| Tabelas do banco | snake_case | `credit_cards` |
| Colunas do banco | snake_case | `billing_month` |
| Constantes | UPPER_SNAKE_CASE | `MAX_INSTALLMENTS` |
| Rotas da API | kebab-case | `/credit-cards` |

### Backend (NestJS)

- Seguir padrão modular: `module` → `controller` → `service` → `dto`
- Cada módulo em sua pasta dentro de `src/modules/`
- DTOs separados para request e response quando necessário
- Validação com `class-validator` + `class-transformer`
- Erros tratados com exceptions do NestJS (`NotFoundException`, `BadRequestException`, etc.)

### Mobile (Expo)

- Seguir padrão Expo Router (file-based routing)
- Componentes reutilizáveis em `components/`
- Chamadas de API em `services/`
- Estado global em `stores/` (Zustand)
- Tokens e tema em `theme/` (Tamagui)

---

## 3. Regras de Swagger / API

- **Todo endpoint** DEVE ter decorators do Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- **Todo DTO** DEVE ter `@ApiProperty({ example: ... })` com exemplos realistas
- **Respostas de erro** devem ser documentadas (`@ApiResponse({ status: 401, description: 'Não autorizado' })`)
- Deve ser possível **testar qualquer endpoint direto no Swagger** sem digitar nada manualmente
- Swagger acessível em: `http://localhost:3000/api` (em dev)

---

## 4. Regras de Documentação

### Quando atualizar

| Mudança | Documento |
|---|---|
| Regra de negócio nova ou alterada | `REGRAS_DE_NEGOCIO.md` |
| Stack, módulo, endpoint, schema, infra | `ARQUITETURA.md` |
| Cor, componente, tela, token, interação | `DESIGN.md` |
| Regra operacional, git, convenção | `AGENTS.md` |

### Regras de manutenção

- Referências cruzadas entre documentos devem ser mantidas atualizadas
- Seções devem estar sempre **numeradas corretamente** (renumerar ao inserir/remover)
- Ao adicionar uma decisão tecnológica → marcar na seção 15 do `REGRAS_DE_NEGOCIO.md`
- Novos endpoints → adicionar na seção de Swagger do `ARQUITETURA.md` com exemplos

---

## 5. Fonte de Verdade

| Assunto | Documento |
|---|---|
| O que o app faz (regras, fluxos, dados) | `REGRAS_DE_NEGOCIO.md` |
| Como o app é construído (stack, schema, endpoints) | `ARQUITETURA.md` |
| Como o app se parece (cores, telas, componentes) | `DESIGN.md` |
| Como trabalhamos no projeto (git, código, operação) | `AGENTS.md` |

---

## 6. Lembretes Importantes

### Regras de negócio críticas

- O projeto deve ter **zero custo** inicialmente
- `billing_month` é **salvo no lançamento**, não calculado em runtime
- `category_mapping` (dicionário do usuário) tem **prioridade sobre a IA** — consultar antes de chamar o Ollama
- Parcelas com `Nx` **assumem crédito** automaticamente (editável na confirmação)
- Primeira parcela **absorve centavo excedente** no arredondamento
- Cartões de crédito são **exclusivos para crédito** — débito/pix/dinheiro não precisam de cartão
- Chat é a **tela principal** (tab 1, abre primeiro após login)

### Cuidados técnicos

- Nunca hardcodar cores no mobile — usar tokens do Tamagui definidos no `DESIGN.md`
- Nunca hardcodar strings de erro — usar constantes
- Sempre validar DTOs no backend — nunca confiar no input do frontend
- Ollama pode ser lento na primeira chamada (cold start) — tratar timeout
- JWT deve ter tempo de expiração configurável via variável de ambiente

---

## 7. Comandos Úteis

### Subir o ambiente local

```bash
# Na raiz do projeto
docker compose up -d              # Sobe Postgres + Ollama

# Backend
cd backend
npm install
npm run start:dev                 # NestJS em http://localhost:3000
                                  # Swagger em http://localhost:3000/api

# Mobile
cd mobile
npm install
npx expo start                   # Expo Dev Server, escanear QR com Expo Go
```

### Migrations (Drizzle)

```bash
cd backend
npx drizzle-kit generate          # Gerar migration a partir do schema
npx drizzle-kit migrate           # Aplicar migrations no banco
npx drizzle-kit studio            # Interface visual do banco (opcional)
```

### Build para produção

```bash
# Backend
cd backend
npm run build                     # Compila TypeScript → dist/
npm run start:prod                # Roda o build

# Mobile
cd mobile
npx eas build --platform android  # APK/AAB na nuvem (30 builds grátis/mês)
npx eas build --platform ios      # IPA na nuvem
```

### Git

```bash
git checkout -b feat/nome         # Nova feature branch
git add .
git commit -m "feat(backend): descrição"
git push -u origin feat/nome      # Push + set upstream
# Abrir PR no GitHub: feat/nome → dev
```
