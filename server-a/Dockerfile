FROM node:20

WORKDIR /usr/src/app/server-a

# Asennetaan riippuvuudet
COPY server-a/package*.json ./
RUN npm install

# Kopioidaan vain JS-tiedostot, EI node_modules
COPY server-a/index.js ./index.js
COPY server-a/database.js ./database.js

# Kopioidaan frontend-kansio konttiin viereen (../frontend)
COPY frontend ../frontend

EXPOSE 3000

CMD ["node", "index.js"]