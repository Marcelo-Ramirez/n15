# --- 1. Etapa de Dependencias ---
# Instala TODAS las dependencias (incluyendo devDependencies)
# Es crucial copiar 'schema.prisma' para que 'npm install' genere el motor de Prisma para la plataforma correcta.
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/
RUN npm install

# --- 2. Etapa de Construcción (Builder) ---
# Aquí se construye la app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# ⚠️ ¡Importante! Tu script "build" usa --turbopack.
# Turbopack es experimental y puede fallar en la compilación cruzada a ARM.
# Si el build falla, quita "--turbopack" de tu package.json.
RUN npm run build

# --- 3. Etapa Final (Runner) ---
# Esta es la imagen final que irá a producción
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia solo los archivos 'standalone' generados
COPY --from=builder /app/.next/standalone ./

# Copia los assets estáticos y las imágenes
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# --- 4. Etapa de Exportación (OPCIONAL) ---
# Esta etapa especial se usa solo si quieres exportar los archivos
# sin el resto del sistema operativo (usando --output)
FROM scratch AS export
COPY --from=runner /app ./