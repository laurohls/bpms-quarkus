FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml pom.xml
COPY src src

RUN mvn -B -ntp clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/target/quarkus-app/ /app/

EXPOSE 82

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
