FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY order-service/pom.xml .
COPY order-service/src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
