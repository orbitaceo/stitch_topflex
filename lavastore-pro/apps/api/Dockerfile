# Dockerfile
# Este arquivo constrói a API Fastify para produção usando multi-stage build.

# Stage 1: Dependências e Build
FROM node:20-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar workspace manifestos e package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Instalar dependências (ignorando postinstall do Prisma)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN pnpm install --frozen-lockfile

# Copiar tsconfig base do monorepo (necessário para o extends do apps/api/tsconfig.json)
COPY tsconfig.base.json ./

# Copiar todo o código fonte da API e dos pacotes
COPY apps/api ./apps/api
COPY packages ./packages

# Executar o gerador do Prisma e transpilação do TypeScript
WORKDIR /app/apps/api
RUN npx prisma generate
RUN pnpm run build

# Stage 2: Produção (Imagem menor e mais segura)
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar pnpm na imagem final
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV PORT=3001

# Copiar arquivos necessários do estágio builder
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml  ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages ./packages

# Instalar APENAS as dependências de produção para salvar espaço (ignorando postinstall do Prisma)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN pnpm install --prod --frozen-lockfile

# Gerar Prisma client novamente para garantir os binários do alpine
WORKDIR /app/apps/api
RUN npx prisma generate

EXPOSE 3001

# O comando de start irá rodar as migrations seguras e iniciar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
