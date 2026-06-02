# BNO News API

Backend da BNO News — Node.js + Fastify + TypeScript + Prisma + PostgreSQL (Supabase).

## Pré-requisitos

- Node.js 20+
- npm
- PostgreSQL (Supabase)

## Configuração inicial

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env
# Preencher DATABASE_URL com a connection string do Supabase

# 3. Gerar o Prisma Client
npm run prisma:generate

# 4. Rodar em desenvolvimento
npm run dev
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia a build de produção |
| `npm run prisma:generate` | Gera o Prisma Client a partir do schema |
| `npm run prisma:migrate` | Executa migrations pendentes |
| `npm run prisma:studio` | Abre o Prisma Studio |
| `npm run prisma:seed` | Popula o banco com dados iniciais |

## Endpoints

### Healthcheck

```
GET /api/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-06-02T00:00:00.000Z",
  "uptime": 42.5
}
```

## Estrutura do projeto

```
src/
  app.ts          # Configuração do Fastify (plugins, rotas)
  server.ts       # Entry point — inicializa e faz listen
  routes/         # Handlers HTTP organizados por domínio
  services/       # Regras de negócio (sem acoplamento ao HTTP)
  middleware/     # Plugins e hooks do Fastify
  lib/            # Clientes compartilhados (Prisma, etc.)
prisma/
  schema.prisma   # Schema do banco de dados
  seed.ts         # Script de seed para desenvolvimento
```
