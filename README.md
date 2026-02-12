# Decizyon Ticket Flow

Plataforma corporativa para criar, automatizar e governar workflows internos. Este repositório entrega o site público, portal do cliente, console de suporte, multi-tenant, autenticação e MVP de billing.

## Stack
- Next.js (App Router) + React + TypeScript
- TailwindCSS + shadcn/ui + lucide-react
- Postgres + Prisma ORM
- Auth.js/NextAuth (Credentials)
- Zod + React Hook Form
- Docker Compose (Postgres)
- Playwright (smoke tests)

## Requisitos
- Node.js 18+
- pnpm (recomendado via Corepack)
- Docker

## Setup local

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Acesse: `http://localhost:3000`

### Rotas principais
- Site público: `/`
- Portal do cliente: `/app`
- Support Console: `/support`

### Credenciais demo
- **OWNER**: owner@acme.com / Admin@123
- **MEMBER**: user@acme.com / User@123
- **SUPPORT**: support@ticketflow.com / Support@123

## Scripts
- `pnpm dev` — iniciar app
- `pnpm db:up` — subir Postgres via Docker
- `pnpm db:migrate` — aplicar migrações
- `pnpm db:seed` — popular base demo
- `pnpm test:e2e` — Playwright (login + criar chamado)

## Estrutura
- `src/app/(public)` — site público
- `src/app/(portal)/app` — portal do cliente
- `src/app/(support)/support` — console de suporte
- `src/app/api` — rotas API
- `prisma/` — schema, migração e seed
- `public/uploads` — storage local (dev)

## Feature flags
- `STRIPE_ENABLED=true` habilita estrutura de integração (MVP não cobra).
- `TEAMS_WEBHOOK_URL` ativa o webhook (placeholder).

## Observações
- **SSO**: existe placeholder em `src/lib/sso.ts` para futura integração.
- **Storage**: arquivos são salvos em `public/uploads` via `StorageProvider`.
- **Email**: envio via SMTP (`SMTP_*`). Em dev, se SMTP nao estiver completo, cai para modo mock e grava em `EmailLog`.

## Deploy (VPS/Cloud)
1. Configure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
2. Suba o banco (Postgres gerenciado ou Docker).
3. Execute `pnpm db:migrate` e `pnpm db:seed` (apenas primeira vez).
4. Build e start:

```bash
pnpm build
pnpm start
```

## Multi-tenant & RBAC
- Dados de tickets e billing sempre escopados por Organization.
- Roles: OWNER, ADMIN, MEMBER por organização; SUPPORT é role global (systemRole).
- Console `/support` é exclusivo para usuários SUPPORT.

