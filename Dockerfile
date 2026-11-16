
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV API_PORT=5001

EXPOSE 4173
EXPOSE 5001

CMD ["sh", "-c", "npm run server & npm run preview -- --host 0.0.0.0 --port 4173"]
