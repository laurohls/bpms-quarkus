FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml pom.xml
COPY motor/pom.xml motor/pom.xml
COPY motor/src motor/src

RUN mvn -B -ntp -pl motor -am clean package -DskipTests -Dquarkus.kubernetes.deploy=false -Dquarkus.container-image.build=false

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/motor/target/quarkus-app/ /app/

EXPOSE 81

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
