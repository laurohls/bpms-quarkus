---
name: motor-bpms
description: Use when working on the Motor BPMS backend (Quarkus + CIB Seven) - process deployment, BPMN, delegates, ProcessService/TaskService, REST endpoints /process and /task. Triggers on motor, ProcessDeployer, ServiceDelegate, process.bpmn, ActivityHistory, TaskResource.
---

# Motor BPMS Backend Skill

Motor é o engine genérico BPMS do repo `bpms-quarkus`. Stack: **Quarkus 3.30.6 + CIB Seven 2.2.0-SNAPSHOT (fork Camunda 7) + H2 in-memory + RESTEasy Reactive** em Java 17. Porta **81**.

## Quando usar
Use esta skill quando:
- Criar/alterar endpoints em `motor/src/main/java/br/com/eyedata/bpms/web/`
- Adicionar/editar BPMN em `motor/src/main/resources/process.bpmn`
- Implementar `JavaDelegate` / `ServiceDelegate`
- Trabalhar com `ProcessService`, `ProcessCatalogService`, `ActiveTaskService`, `TaskActionService`
- Deploy BPMN, histórico, Kubernetes/Jib

## Estrutura de referência

```
motor/
├── pom.xml (parent bpms-scada:1.0-SNAPSHOT)
├── src/main/resources/
│   ├── application.properties # porta 81, H2, cibseven, k8s
│   └── process.bpmn           # processo id="process"
└── src/main/java/br/com/eyedata/bpms/
    ├── ProcessDeployer.java            # motor/src/main/java/br/com/eyedata/bpms/ProcessDeployer.java:1
    ├── delegates/ServiceDelegate.java  # motor/src/main/java/br/com/eyedata/bpms/delegates/ServiceDelegate.java:1
    ├── process/
    │   ├── ProcessService.java          # startProcess() via RuntimeService
    │   ├── ProcessCatalogService.java   # definitions, diagram XML, history
    │   ├── ProcessDefinitionSummary.java
    │   ├── ProcessInstanceSummary.java
    │   ├── ActivityHistorySummary.java
    │   └── CreateProcessRequest.java    # Map<String,Object> variables
    ├── task/
    │   ├── ActiveTaskService.java       # findActiveTasks()
    │   ├── TaskActionService.java       # findDetailsById, claim, unclaim, complete
    │   ├── TaskSummary.java
    │   ├── TaskDetails.java             # agrega Task + ProcessInstanceDetails + variables
    │   ├── ProcessInstanceDetails.java
    │   ├── ClaimTaskRequest.java        # String userId
    │   └── CompleteTaskRequest.java     # Map variables
    └── web/
        ├── ProcessResource.java         # motor/src/main/java/br/com/eyedata/bpms/web/ProcessResource.java:23
        └── TaskResource.java            # motor/src/main/java/br/com/eyedata/bpms/web/TaskResource.java:22
```

## Configuração (application.properties)

```properties
quarkus.http.port=81
quarkus.datasource.db-kind=h2
quarkus.datasource.jdbc.url=jdbc:h2:mem:process-engine;DB_CLOSE_DELAY=-1
quarkus.cibseven.generic-config.history=full
quarkus.cibseven.generic-config.database-schema-update=true
quarkus.cibseven.job-executor.thread-pool.max-pool-size=5
quarkus.container-image.build=true # group cibseven, name quarkus-motor-example
quarkus.kubernetes.deploy=true # imagePullPolicy Never, namespace default
```

CORS liberado para `localhost:3002` e `localhost:5173` (Vite).

## Fluxo BPMN atual (process.bpmn)

`process` (historyTimeToLive=1) linear:
`StartEvent_1` -> `ServiceTask_1` (`#{serviceDelegate}`) -> `RHReviewTask` (candidateGroups=RH, formData: rhDecision enum APPROVED/REJECTED/ADJUSTMENT_REQUIRED + rhResponse) -> `EmployeeResponseTask` (assignee=`${email}`) -> `EndEvent_1`

Exportado por Camunda Modeler 5.34.0, namespace `camunda:` compatível CIB7.

## Endpoints REST

### ProcessResource @Path("/process") - motor/src/main/java/br/com/eyedata/bpms/web/ProcessResource.java:23
- `POST /process` JSON `{variables: {...}}` -> 201 `ProcessInstanceSummary` (id, processKey) | delega para `ProcessService.startProcess()` que chama `runtimeService.startProcessInstanceByKey("process", variables)`
- `GET /process/definitions` -> List<ProcessDefinitionSummary> (latestVersion)
- `GET /process/definitions/{id}/diagram` -> 200 application/xml ou 404 (via `repositoryService.getProcessModel`)
- `GET /process/instances/{processInstanceId}/history` -> List<ActivityHistorySummary> (via `historyService.createHistoricActivityInstanceQuery`)

### TaskResource @Path("/task") - motor/src/main/java/br/com/eyedata/bpms/web/TaskResource.java:22
- `GET /task` -> List<TaskSummary> (active, initializeFormKeys, orderByCreateTime desc)
- `GET /task/{taskId}` -> 200 TaskDetails ou 404 (agrega task + processInstance + processVariables + taskVariables)
- `POST /task/{taskId}/claim` JSON `{userId}` -> 400 se blank, 404 se not found, 200 TaskSummary
- `POST /task/{taskId}/unclaim` -> 404 check, 200 TaskSummary
- `POST /task/{taskId}/complete` JSON `{variables}` -> 404 check, 204 No Content

## Padrões arquiteturais

- **CDI**: `@ApplicationScoped`, `@Inject`, `@Named("serviceDelegate")`, `@Observes StartupEvent`
- **Delegate**: `ServiceDelegate implements JavaDelegate` registrado como `#{serviceDelegate}` no BPMN - motor/src/main/java/br/com/eyedata/bpms/delegates/ServiceDelegate.java:1
- **Deployer idempotente**: `ProcessDeployer.deployProcess()` faz `createDeployment().addClasspathResource("process.bpmn").enableDuplicateFiltering(true).deploy()` - motor/src/main/java/br/com/eyedata/bpms/ProcessDeployer.java:1
- **DTO Translator**: factories `from(Task)`, `from(ProcessDefinition)` isolam API CIB7 da serialização Jackson
- **CQRS leve**: `ActiveTaskService` (leitura) vs `TaskActionService` (escrita/claim/complete)
- **Null-safe**: `CreateProcessRequest.getVariables()` retorna `emptyMap()` se null; Resources tratam `request==null ? emptyMap()`

## Workflows comuns

### 1. Adicionar novo Service Task + Delegate
1. Criar `src/main/java/br/com/eyedata/bpms/delegates/MeuDelegate.java`:
```java
@ApplicationScoped @Named("meuDelegate")
public class MeuDelegate implements JavaDelegate {
  public void execute(DelegateExecution ex) {
    ex.setVariable("resultado", "ok");
  }
}
```
2. Editar `process.bpmn`: `<bpmn:serviceTask camunda:delegateExpression="#{meuDelegate}" />`
3. Verificar deploy: `ProcessDeployer` loga definitions no startup

### 2. Adicionar novo endpoint
- Criar DTO em `process/` ou `task/` seguindo padrão `from()`
- Criar método em Service injetando `RuntimeService`/`TaskService`/`HistoryService`
- Expor em `ProcessResource` ou `TaskResource` com tratamento 404/400
- Testar: `curl http://localhost:81/process/definitions`

### 3. Alterar UserTask / formData
Editar `process.bpmn` -> `RHReviewTask` / `EmployeeResponseTask`: ajustar `candidateGroups`, `assignee="${var}"`, `<camunda:formData>` fields. Frontend consome `formKey` e `taskDefinitionKey`.

### 4. Rodar local
```bash
mvn -pl motor quarkus:dev          # porta 81, hot reload
curl -X POST http://localhost:81/process -H "Content-Type: application/json" -d '{"variables":{"email":"ana@eyedata.com","days":5}}'
curl http://localhost:81/task
curl http://localhost:81/process/definitions
```

### 5. Build Kubernetes (kind)
```bash
mvn clean package -Dquarkus.kubernetes.deploy=true -Dquarkus.profile=kind
kind load docker-image cibseven/quarkus-motor-example:latest --name eyedata-local
kubectl rollout restart deployment motor
kubectl port-forward service/motor 8080:81
```

## Dependências (motor/pom.xml)
- `org.cibseven.bpm:cibseven-engine`
- `org.cibseven.spin:cibseven-spin-core`
- `org.cibseven.bpm.quarkus:cibseven-bpm-quarkus-engine`
- `io.quarkus:quarkus-rest`, `quarkus-rest-jackson`, `quarkus-jdbc-h2`, `quarkus-kubernetes`, `quarkus-container-image-jib`

## Pitfalls & checagens
- H2 é volátil (`DB_CLOSE_DELAY=-1` mantém enquanto JVM viva, perde ao restart) - não usar em prod
- Sem auth, sem paginação, sem ExceptionMapper global - erros CIB7 viram 500
- Porta real 81 diverge de READMEs que citam 8080
- `process.bpmn` historyTimeToLive=1 dia
- Sem `src/test` no motor - `quarkus-junit5` declarado mas não usado
- Frontend espera `http://localhost:81` (VITE_API_URL fallback) - verificar `processos/socilitacao-ferias/frontend/src/App.tsx:16`

## Verificação
Após alterar, compile: `mvn -pl motor clean compile` e teste endpoints acima. Verifique logs do `ProcessDeployer` no startup para confirmar deployment BPMN.
