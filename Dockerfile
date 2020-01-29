FROM node:13-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV CA_PATH /ca
ENV DB_PATH /db.json
ENV PORT 8080
EXPOSE 8080
CMD [ "npm", "start" ]