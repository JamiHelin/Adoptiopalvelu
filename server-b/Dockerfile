FROM node:20

WORKDIR /usr/src/app/server-b

COPY server-b/package*.json ./
RUN npm install

COPY server-b ./

EXPOSE 3002

CMD ["node", "index.js"]