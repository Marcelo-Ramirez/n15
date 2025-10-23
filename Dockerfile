# --- ETAPA 1: El Builder (Multi-plataforma) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copia el resto del código (incluyendo schema.prisma)
COPY . .

# --- LÍNEA AÑADIDA ---
# Genera el cliente de Prisma (y los tipos como 'Ingredient')
RUN npx prisma generate

# Ahora el build encontrará el tipo 'Ingredient'
RUN npm run build

# --- ETAPA 2: El Runner (La imagen final que queremos copiar) ---
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production

# Copia los artefactos compilados desde la etapa 'builder'
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# --- IMPORTANTE: Copia el cliente de Prisma generado ---
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copia tus certificados SSL
COPY --from=builder /app/fullchain.pem ./fullchain.pem
COPY --from=builder /app/privkey.pem ./privkey.pem