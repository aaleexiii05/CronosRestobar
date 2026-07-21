FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY reservation-service/pom.xml .
COPY reservation-service/src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
