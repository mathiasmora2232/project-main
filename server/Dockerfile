FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Crear archivo .env si no existe
RUN cp .env.example .env || true

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["sh", "-c", "npm run db:init && npm run db:seed && npm start"]
