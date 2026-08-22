---
name: solicitacao-ferias-backend
description: Use when working on the solicitacao-ferias backend stub (Quarkus mock without DB/BPMN) at processos/socilitacao-ferias/backend. Triggers on HealthResource, ProcessResource mock, porta 82, solicitacao-ferias, socilitacao typo, HealthResource.java 19 lines.
---

# Solicitação de Férias Backend Skill

Backend stub em `processos/socilitacao-ferias/backend` (typo `socilitacao` preservado do repo). **Quarkus 3.30.6 standalone sem CIB Seven, sem DB, sem BPMN**. Porta **82**. Mock puro - não persiste no motor. Único código versionado é `HealthResource`.

## Quando usar

Use quando:
- Editar `HealthResource.java` ou teste `ProcessResourceTest.java`
- Integrar este stub com o Motor real (porta 81) - proxy pattern
- Ajustar `application.properties` porta 82, CORS
- Limpar `target/` com bytecode stale `org.cibseven.ferias.ProcessResource`
- Adicionar lógica real de férias (deve proxyar para Motor ou migrar BPMN)

## Estrutura real

```
processos/socilitacao-ferias/backend/
├── pom.xml  # artifact solicitacao-ferias:1.0.0-SNAPSHOT, standalone (não herda parent bpms-scada)
├── Dockerfile
├── src/main/resources/application.properties # porta 82, cors 3002/5173
├── src/main/java/br/com/eyedata/bpms/processo/ferias/
│   └── HealthResource.java # processos/socilitacao-ferias/backend/src/main/java/br/com/eyedata/bpms/processo/ferias/HealthResource.java:1 (19 linhas)
└── src/test/java/br/com/eyedata/bpms/processo/ferias/
    └── ProcessResourceTest.java # 2 testes: /start-process e /health
# target/classes/org/cibseven/ferias/ProcessResource.class  # STALE - não versionado, mock GET /start-process
```

**Atenção**: `src/main/java` contém apenas 1 arquivo versionado. `ProcessResource` só existe como `.class` em `target/` (pacote `org.cibseven.ferias` divergente).

## Configuração (application.properties)

```properties
quarkus.http.port=82
quarkus.http.cors.enabled=true
quarkus.http.cors.origins=http://localhost:3002,http://127.0.0.1:3002,http://localhost:5173,http://127.0.0.1:5173
quarkus.http.cors.methods=GET,POST,OPTIONS
quarkus.http.cors.headers=Accept,Content-Type
```

Sem `quarkus.datasource.*`, sem `quarkus.cibseven.*`, sem `quarkus.kubernetes.*`. CORS mais restrito que motor (sem 3003, sem PUT/DELETE/Authorization).

## Código atual

### HealthResource - processos/socilitacao-ferias/backend/src/main/java/br/com/eyedata/bpms/processo/ferias/HealthResource.java:1
```java
package br.com.eyedata.bpms.processo.ferias;
@Path("/health")
public class HealthResource {
  @GET @Produces(APPLICATION_JSON)
  public Response health() {
    return Response.ok(Map.of("status","UP","service","solicitacao-ferias-backend")).build();
  }
}
```

### ProcessResource (stale, apenas em target/classes/org/cibseven/ferias/ProcessResource.class)
```java
@Path("/start-process")
public class ProcessResource {
  @GET @Produces("text/plain")
  public String startProcess() { return "Instancia Criada: " + UUID.randomUUID(); }
}
```
Bytecode compilado mas **fonte não existe em git** - pacote `org.cibseven.ferias` divergente do versionado `br.com.eyedata.bpms.processo.ferias`. `mvn clean` apaga.

### Teste - src/test/java/.../ProcessResourceTest.java
```java
@QuarkusTest
class ProcessResourceTest {
  @Test void shouldStartProcess(){ given().get("/start-process").then().status(200).body(startsWith("Instancia Criada: ")); }
  @Test void shouldReportHealth(){ given().get("/health").then().status(200).body("status",is("UP")); }
}
```
Teste espera `GET /start-process` mas fonte não existe - falha após `mvn clean` até recriar stub.

## Endpoints efetivos (com target stale)

- `GET /health` -> `{"status":"UP","service":"solicitacao-ferias-backend"}` (versionado)
- `GET /start-process` -> `text/plain "Instancia Criada: <UUID>"` (só com target stale)
- `GET /q/health`, `/q/health/live`, `/q/health/ready` (SmallRye Health via `quarkus-smallrye-health`)

Sem `POST /process`, sem `/task`, sem BPMN. Frontend real consome **Motor 81**, não este stub.

## Dependências (pom.xml)

```xml
quarkus-rest
quarkus-rest-jackson
quarkus-smallrye-health
quarkus-junit5 (test)
rest-assured (test)
```
Ausentes vs motor: `cibseven-engine`, `cibseven-spin-core`, `cibseven-bpm-quarkus-engine`, `quarkus-jdbc-postgresql`, `quarkus-kubernetes`, `quarkus-container-image-jib`.

Standalone: define `quarkus.platform.version 3.30.6` localmente, não herda parent `bpms-scada`.

## Dívida técnica crítica

1. **Órfão do aggregator**: `pom.xml` raiz só agrega `<module>motor</module>` - backend não compila com `mvn clean install` na raiz; precisa `-f` específico.
2. **Mock quebra contrato Motor**: Frontend férias (`motorApi.ts:9` + `SolicitarFeriasForm.tsx:74`) faz `POST http://localhost:81/process {variables:{email,employeeName,...}}` esperando `ProcessInstanceSummary`. Stub faz `GET /start-process` com UUID - nunca cria `RHReviewTask`/`EmployeeResponseTask`.
3. **Pacote desalinhado**: versionado `br.com.eyedata.bpms.processo.ferias` vs compilado `org.cibseven.ferias` - `mvn clean` remove mock e testes falham.
4. **Sem integração**: Deveria proxyar para `http://localhost:81/process` ou ser removido.
5. **CORS divergente**: motor permite 3003 + PUT/DELETE + Authorization, stub não.
6. **README desatualizado**: cita porta 8080 vs real 82.

## Workflows

### Rodar stub
```bash
cd processos/socilitacao-ferias/backend
mvn quarkus:dev # porta 82
curl http://localhost:82/health # {"status":"UP","service":"solicitacao-ferias-backend"}
curl http://localhost:82/start-process # só funciona com target stale
curl http://localhost:82/q/health # SmallRye
```

### Verificar estado do stub
```bash
# Checar se ProcessResource existe
ls target/classes/org/cibseven/ferias/ProcessResource.class 2>&1
# Ver fonte versionada
ls src/main/java/br/com/eyedata/bpms/processo/ferias/
mvn -f processos/socilitacao-ferias/backend/pom.xml clean test # 2 testes, falha se limpou stale
```

### Integrar com Motor (recomendado - transformar stub em proxy)
1. Adicionar `quarkus-rest-client`:
```xml
<dependency><groupId>io.quarkus</groupId><artifactId>quarkus-rest-client-jackson</artifactId></dependency>
```
2. Criar `FeriasProcessService.java`:
```java
@ApplicationScoped
public class FeriasProcessService {
  @Inject @RestClient MotorProxyClient motorClient; // baseUri http://localhost:81
  public String criarSolicitacao(Map<String,Object> vars) {
    // POST http://localhost:81/process {variables: vars} -> ProcessInstanceSummary
  }
}
```
3. Criar `FeriasResource.java`:
```java
@Path("/ferias")
public class FeriasResource {
  @POST @Consumes(APPLICATION_JSON)
  public Response criar(CreateFeriasRequest req) { /* valida employeeName/email/startDate<endDate/reason.length>=10 -> proxy motor */ }
}
```
4. Ou migrar BPMN: copiar `motor/src/main/resources/process.bpmn`, adicionar `cibseven-bpm-quarkus-engine` + `quarkus-jdbc-postgresql`, configurar `quarkus.cibseven.*` + `quarkus.datasource.*`.

### Fix pacote stale (recriar fonte)
```bash
cd processos/socilitacao-ferias/backend
mvn clean # remove stale
# Criar src/main/java/br/com/eyedata/bpms/processo/ferias/ProcessResource.java com POST real ou proxy
# Exemplo mínimo para fazer teste passar:
cat > src/main/java/br/com/eyedata/bpms/processo/ferias/ProcessResource.java <<'JAVA'
package br.com.eyedata.bpms.processo.ferias;
import java.util.UUID; import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
@Path("/start-process") public class ProcessResource {
  @GET @Produces(MediaType.TEXT_PLAIN) public String startProcess(){ return "Instancia Criada: "+UUID.randomUUID(); }
}
JAVA
mvn test # deve passar
```

### Adicionar validação (seguir padrão Motor)
Seguir `ClaimTaskRequest` que valida `userId.isBlank() -> 400`. Aplicar para `employeeName.length>=3`, `email` não blank, `startDate<endDate`, `reason.length>=10` (como `SolicitarFeriasForm.tsx:27`).

## Verificação

```bash
mvn -f processos/socilitacao-ferias/backend/pom.xml clean test # 2 testes rest-assured
curl http://localhost:82/health | jq # {"status":"UP"}
curl http://localhost:82/q/health | jq
# Após clean, verificar se /start-process ainda responde (se não, recriar ProcessResource.java)
```

## Quando NÃO usar

Para lógica BPMS real (deploy BPMN, delegates, TaskService, PostgreSQL), use skill `motor-bpms`. Para frontend férias, use `solicitacao-ferias-frontend`. Este backend é stub temporário - considere remover ou transformar em proxy para motor:81.
