FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080 8081 3478/udp
CMD ["node", "dynamicServer.js"]
