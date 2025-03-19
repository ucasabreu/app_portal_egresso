# Usa uma imagem base com o JDK 17
FROM eclipse-temurin:17.0.8.1_1-jdk-jammy

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia todos os arquivos do projeto para o contêiner
COPY . .

# Executa o Maven Wrapper para construir o projeto
RUN ./mvnw clean package

# Expõe a porta padrão do Spring Boot (8080)
EXPOSE 8080

# Define o comando de entrada para executar a aplicação
ENTRYPOINT ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]

