# Etapa 1: Build y dependencias
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Etapa 2: Standalone, dependencias y empaquetado final
FROM --platform=linux/arm64 node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia el standalone y los assets necesarios
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY .env .env

# Instala jq
RUN apk add --no-cache jq

# Limpia devDependencies del package.json standalone (opcional)
RUN jq 'del(.devDependencies)' package.json > package-clean.json && mv package-clean.json package.json

# Instala solo dependencias de producción necesarias para standalone
RUN npm install --omit=dev

# Genera Prisma Client para la plataforma final
RUN npx prisma generate

# Etapa 3: Exportar solo la carpeta /app (sin CMD)
FROM scratch AS exportapp
COPY --from=runner /app /app