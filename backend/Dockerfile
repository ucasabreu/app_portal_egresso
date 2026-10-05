FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system portal && useradd --system --gid portal portal
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar ./app.jar
USER portal
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
