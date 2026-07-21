FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY inventory-service/pom.xml .
COPY inventory-service/src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
