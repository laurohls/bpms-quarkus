---
name: solicitacao-ferias-backend
description: Use when working on the solicitacao-ferias backend stub (Quarkus mock without DB/BPMN) at processos/socilitacao-ferias/backend. Triggers on HealthResource, ProcessResource mock, porta 82, solicitacao-ferias, UUID Instancia Criada. Use ONLY when editing or integrating this stub backend.
---

# Solicitação de Férias Backend Skill

Backend stub Vite-facing em `processos/socilitacao-ferias/backend` (typo `socilitacao` intencional do repo). **Quarkus 3.30.6 standalone sem CIB Seven, sem DB, sem BPMN**. Porta **82**. Mock puro que gera `UUID.randomUUID()` - não persiste no motor.

## Quando usar
Use quando:
- Editar `HealthResource` ou `ProcessResourceTest`
- Integrar este stub com o Motor real (porta 81)
- Ajustar `application.properties` porta 82, CORS
- Corrigir divergência de pacotes `br.com.eyedata.bpms.processo.ferias` vs `org.cibseven.ferias` (stale target)
- Adicionar lógica real de férias (deve proxyar para Motor)

## Estrutura real

```
processos/socilitacao-ferias/backend/
├── pom.xml  # artifact solicitacao-ferias:1.0.0-SNAPSHOT, standalone (não herda parent bpms-scada)
├── src/main/resources/application.properties
├── src/main/java/br/com/eyedata/bpms/processo/ferias/
│   └── HealthResource.java # processos/socilitacao-ferias/backend/src/main/java/br/com/eyedata/bpms/processo/ferias/HealthResource.java:1
└── src/test/java/br/com/eyedata/bpms/processo/ferias/
    └── ProcessResourceTest.java
# target/classes/org/cibseven/ferias/ProcessResource.class  # STALE - não versionado, mock GET /start-process
```

## Configuração (application.properties)

```properties
quarkus.http.port=82
quarkus.http.cors.enabled=true
quarkus.http.cors.origins=http://localhost:3002,http://127.0.0.1:3002,http://localhost:5173,http://127.0.0.1:5173
quarkus.http.cors.methods=GET,POST,OPTIONS
quarkus.http.cors.headers=Accept,Content-Type
```

Sem `quarkus.datasource.*`, sem `quarkus.cibseven.*`, sem `quarkus.kubernetes.*`.

## Código atual

### HealthResource - processos/socilitacao-ferias/backend/src/main/java/br/com/eyedata/bpms/processo/ferias/HealthResource.java:11
```java
@Path("/health")
public class HealthResource {
  @GET @Produces(APPLICATION_JSON)
  public Response health() {
    return Response.ok(Map.of("status","UP","service","solicitacao-ferias-backend")).build();
  }
}
```

### ProcessResource (stale, apenas em target)
Bytecode em `target/classes/org/cibseven/ferias/ProcessResource.class`:
```java
@Path("/start-process")
public class ProcessResource {
  @GET @Produces("text/plain")
  public String startProcess() { return "Instancia Criada: " + UUID.randomUUID(); }
}
```
Não versionado em git, pacote `org.cibseven.ferias` divergente do versionado `br.com.eyedata...`.

### Teste - src/test/java/.../ProcessResourceTest.java
```java
@QuarkusTest
class ProcessResourceTest {
  @Test void shouldStartProcess(){ given().get("/start-process").then().status(200).body(startsWith("Instancia Criada: ")); }
  @Test void shouldReportHealth(){ given().get("/health").then().status(200).body("status",is("UP")); }
}
```

## Endpoints efetivos
- `GET /health` -> `{"status":"UP","service":"solicitacao-ferias-backend"}`
- `GET /start-process` -> `text/plain "Instancia Criada: <UUID>"` (mock)
- `GET /q/health`, `/q/health/live`, `/q/health/ready` (SmallRye Health via `quarkus-smallrye-health`)

Sem `POST /process`, sem `/task`, sem BPMN.

## Dependências (pom.xml)
```xml
quarkus-rest
quarkus-rest-jackson
quarkus-smallrye-health
quarkus-junit5 (test)
rest-assured (test)
```
Ausentes vs motor: `cibseven-engine`, `cibseven-spin-core`, `cibseven-bpm-quarkus-engine`, `quarkus-jdbc-h2`, `quarkus-kubernetes`, `quarkus-container-image-jib`.

## Dívida técnica crítica

1. **Órfão do aggregator**: `pom.xml` raiz (`bpms-quarkus/pom.xml`) só agrega `<module>motor</module>` - backend não compila com `mvn clean install` na raiz.
2. **Mock quebra contrato Motor**: Frontend real (`frontend/src/App.tsx:16`) faz `POST http://localhost:81/process {variables:{email,days}}` esperando `ProcessInstanceSummary`. Stub faz `GET /start-process` com UUID - processo nunca cria `RHReviewTask`/`EmployeeResponseTask` no engine.
3. **Pacote desalinhado**: versionado `br.com.eyedata.bpms.processo.ferias` vs compilado `org.cibseven.ferias` - `mvn clean` remove o mock.
4. **Sem integração**: Deveria proxyar para `http://localhost:81/process`.
5. **README desatualizado**: cita porta 8080 vs real 82.

## Workflows

### Rodar stub
```bash
cd processos/socilitacao-ferias/backend
mvn quarkus:dev # porta 82
curl http://localhost:82/health
curl http://localhost:82/start-process
curl http://localhost:82/q/health
```

### Integrar com Motor (recomendado)
Transformar stub em proxy real:

1. Adicionar dependência `quarkus-rest-client` ou usar `java.net.http.HttpClient`
2. Criar `FeriasProcessService.java`:
```java
@ApplicationScoped
public class FeriasProcessService {
  @Inject RestClient motorClient; // baseUri http://localhost:81
  public String criarSolicitacao(Map<String,Object> vars) {
    // POST http://localhost:81/process {variables: vars}
  }
}
```
3. Criar `FeriasResource.java`:
```java
@Path("/ferias")
public class FeriasResource {
  @POST @Consumes(APPLICATION_JSON)
  public Response criar(CreateFeriasRequest req) { /* valida email/startDate/endDate -> proxy motor */ }
}
```
4. Ou migrar BPMN para cá: copiar `motor/src/main/resources/process.bpmn`, adicionar `cibseven-bpm-quarkus-engine` e `quarkus-jdbc-h2`, configurar `quarkus.cibseven.*`.

### Fix pacote stale
```bash
cd processos/socilitacao-ferias/backend
mvn clean
# recriar src/main/java/br/com/eyedata/bpms/processo/ferias/ProcessResource.java com POST real
```

### Adicionar validação
Seguir padrão Motor: `ClaimTaskRequest` valida `userId.isBlank() -> 400`. Aplicar para `employeeName`, `email`, `startDate < endDate`.

## Verificação
```bash
mvn -pl processos/socilitacao-ferias/backend clean test # 2 testes rest-assured
curl http://localhost:82/health | jq
```

## Quando NÃO usar
Para lógica BPMS real (deploy BPMN, delegates, TaskService), use skill `motor-bpms` em vez desta. Este backend é stub temporário.
