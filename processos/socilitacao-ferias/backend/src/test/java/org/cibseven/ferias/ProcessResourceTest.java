package org.cibseven.ferias;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.startsWith;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class ProcessResourceTest {

    @Test
    void shouldStartProcess() {
        given()
            .when().get("/start-process")
            .then()
            .statusCode(200)
            .contentType("text/plain")
            .body(startsWith("Instancia Criada: "));
    }

    @Test
    void shouldReportHealth() {
        given()
            .when().get("/health")
            .then()
            .statusCode(200)
            .body("status", org.hamcrest.Matchers.is("UP"));
    }
}
