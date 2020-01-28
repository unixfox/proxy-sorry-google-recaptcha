FROM node:13
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
ENV CA_PATH /ca
ENV DB_PATH /db.json
CMD [ "npm", "start" ]