FROM eclipse-temurin:17.0.8.1_1-jdk-jammy

WORKDIR /app

COPY . .

# REMOVE o SQL antes do build
RUN rm -rf ./backend/src/main/resources/database/

RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
