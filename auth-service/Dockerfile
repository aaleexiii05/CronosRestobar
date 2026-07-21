FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY auth-service/pom.xml .
COPY auth-service/src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
