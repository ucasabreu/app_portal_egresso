# Usa uma imagem base com o JDK 17
FROM eclipse-temurin:17.0.8.1_1-jdk-jammy

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia todos os arquivos do projeto para o contêiner
COPY . .

# Garante que o Maven Wrapper tenha permissões de execução
RUN chmod +x ./mvnw

# Executa o Maven Wrapper para construir o projeto
RUN ./mvnw clean package -DskipTests

# Expõe a porta padrão do Spring Boot (8080)
EXPOSE 8080

# Ajusta o comando de entrada para garantir o nome correto do JAR
ENTRYPOINT ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]