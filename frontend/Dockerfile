FROM node:18
WORKDIR /app

# Copia package.json e .env juntos
COPY package*.json ./
COPY .env ./

RUN npm install
ENV PATH="./node_modules/.bin:$PATH"

# Agora copia o restante do projeto (src, public, etc)
COPY . .

# Faz o build lendo o .env já copiado
RUN npm run build

# Expondo a porta correta
EXPOSE 9090

CMD ["npm", "run", "preview", "--", "--port", "9090", "--host", "0.0.0.0"]
