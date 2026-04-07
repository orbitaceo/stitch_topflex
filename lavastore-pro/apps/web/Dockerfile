# Dockerfile
# Este arquivo constrói o Frontend Next.js para produção em modo Standalone.

FROM node:20-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 1: Instalando dependências globais
FROM base AS deps
# Verificar compatibilidade com pacotes nativos (se houver, como libc)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar configurações centrais do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/

# Instalação limpa
RUN pnpm install --frozen-lockfile

# Stage 2: Build da aplicação
FROM base AS builder
WORKDIR /app

# Copiar deps cacheadas
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copiar todo o código
COPY . .

# Desativar telemetria Next.js (Opcional, melhora privacidade de Logs)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Variáveis Mock para build-time Next.js (Evita falhas ao buildar assets estáticos sem acesso as envs finais)
ENV NEXT_PUBLIC_API_URL="http://localhost:3001"

# Compilar o Front
RUN pnpm --filter web build

# Stage 3: Runner (Imagem super otimizada que conterá apenas output)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# O server.js foi gerado pelo Next.js pro modo standalone na raiz do output
CMD ["node", "apps/web/server.js"]
