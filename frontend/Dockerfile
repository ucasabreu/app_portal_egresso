FROM node:18
WORKDIR /
COPY package*.json ./
RUN npm install
ENV PATH="./node_modules/.bin:$PATH"
COPY . .
RUN npm run build
CMD [ "npm","run", "preview", "--", "--port", "9090" ,"--host", "0.0.0.0"]