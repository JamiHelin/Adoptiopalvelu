FROM node:20

# Työhakemisto kontissa
WORKDIR /usr/src/app/server-a

# Kopioidaan vain server-a:n package-tiedostot ja asennetaan riippuvuudet
COPY server-a/package*.json ./
RUN npm install

# Kopioidaan server-a:n koodi
COPY server-a ./

# Kopioidaan frontend-kansio konttiin viereen (../frontend)
COPY frontend ../frontend

# Palvelin kuuntelee porttia 3000
EXPOSE 3000

# Ajetaan suoraan tuotantotilassa (ei nodemonia)
CMD ["node", "index.js"]