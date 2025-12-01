FROM node:20

WORKDIR /usr/src/app/server-b

COPY server-b/package*.json ./
RUN npm install

# Kopioidaan vain JS-tiedostot
COPY server-b/index.js ./index.js
COPY server-b/database.js ./database.js

EXPOSE 3002

CMD ["node", "index.js"]