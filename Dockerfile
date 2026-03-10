FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3001

CMD ["node", "scripts/migrate.js && node src/app.js"]