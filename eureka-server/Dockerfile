FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY eureka-server/pom.xml .
COPY eureka-server/src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
