FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY ai-service/ai-service/pom.xml .
RUN mvn dependency:go-offline -B
COPY ai-service/ai-service/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "-Dserver.port=${PORT:-8082}", "app.jar"]
