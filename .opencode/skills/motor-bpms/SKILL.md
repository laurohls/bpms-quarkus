---
name: motor-bpms
description: Use when working on the Motor BPMS backend (Quarkus + CIB Seven) - process deployment, BPMN, delegates, ProcessService/TaskService, REST endpoints /process and /task. Triggers on motor, ProcessDeployer, ServiceDelegate, process.bpmn, ActivityHistory, TaskResource, PostgreSQL 5432.
---

# Motor BPMS Backend Skill

Motor é o engine genérico BPMS do repo `bpms-quarkus`. Stack: **Quarkus 3.30.6 + CIB Seven 2.2.0-SNAPSHOT (fork Camunda 7) + PostgreSQL + RESTEasy Reactive** em Java 17. Porta **81**.

## Quando usar

Use esta skill quando:
- Criar/alterar endpoints em `motor/src/main/java/br/com/eyedata/bpms/web/`
- Adicionar/editar BPMN em `motor/src/main/resources/process.bpmn`
- Implementar `JavaDelegate` / `ServiceDelegate`
- Trabalhar com `ProcessService`, `ProcessCatalogService`, `ActiveTaskService`, `TaskActionService`
- Deploy BPMN, histórico, Kubernetes/Jib, PostgreSQL

## Estrutura de referência

```
motor/
├── pom.xml (parent bpms-scada:1.0-SNAPSHOT)
├── Dockerfile
├── src/main/resources/
│   ├── application.properties # porta 81, PostgreSQL bpms:5432, cibseven history full, k8s
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
quarkus.http.cors.enabled=true
quarkus.http.cors.origins=http://localhost:3002,http://127.0.0.1:3002,http://localhost:3003,http://127.0.0.1:3003,http://localhost:5173,http://127.0.0.1:5173
quarkus.http.cors.methods=GET,POST,OPTIONS,PUT,DELETE
quarkus.http.cors.headers=Accept,Content-Type,Authorization

quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=${DB_USERNAME:bpms}
quarkus.datasource.password=${DB_PASSWORD:bpms}
quarkus.datasource.jdbc.url=${DB_JDBC_URL:jdbc:postgresql://localhost:5432/bpms}

quarkus.cibseven.generic-config.history=full
quarkus.cibseven.generic-config.database-schema-update=true
quarkus.cibseven.job-executor.thread-pool.max-pool-size=5

quarkus.container-image.build=true # group cibseven, name quarkus-motor-example
quarkus.kubernetes.deploy=true # imagePullPolicy Never, namespace default
quarkus.kubernetes.ports.http.container-port=81
quarkus.kubernetes.ports.http.host-port=81
```

CORS liberado para `localhost:3002/3003/5173`. DB agora é **PostgreSQL** (não H2) - requer `docker run postgres:16` ou variáveis `DB_*`.

## Fluxo BPMN atual (process.bpmn)

`process` (historyTimeToLive=1) linear - `motor/src/main/resources/process.bpmn:1`:
`StartEvent_1` -> `ServiceTask_1` (`#{serviceDelegate}`) -> `RHReviewTask` (candidateGroups=RH, formData: rhDecision enum APPROVED/REJECTED/ADJUSTMENT_REQUIRED + rhResponse string) -> `EmployeeResponseTask` (assignee=`${email}`) -> `EndEvent_1`

Exportado por Camunda Modeler 5.34.0, namespace `camunda:` compatível CIB7. 5 sequenceFlows.

## Endpoints REST

### ProcessResource @Path("/process") - motor/src/main/java/br/com/eyedata/bpms/web/ProcessResource.java:23
- `POST /process` JSON `{variables: {...}}` -> 201 `ProcessInstanceSummary` (id, processKey) | delega para `ProcessService.startProcess()` que chama `runtimeService.startProcessInstanceByKey("process", variables)`
- `GET /process/definitions` -> List<ProcessDefinitionSummary> (latestVersion) via `ProcessCatalogService`
- `GET /process/definitions/{id}/diagram` -> 200 application/xml ou 404 (via `repositoryService.getProcessModel`)
- `GET /process/instances/{processInstanceId}/history` -> List<ActivityHistorySummary> (via `historyService.createHistoricActivityInstanceQuery`)

### TaskResource @Path("/task") - motor/src/main/java/br/com/eyedata/bpms/web/TaskResource.java:22
- `GET /task` -> List<TaskSummary> (active, initializeFormKeys, orderByCreateTime desc) via `ActiveTaskService`
- `GET /task/{taskId}` -> 200 TaskDetails ou 404 (agrega task + processInstance + processVariables + taskVariables)
- `POST /task/{taskId}/claim` JSON `{userId}` -> 400 se blank, 404 se not found, 200 TaskSummary
- `POST /task/{taskId}/unclaim` -> 404 check, 200 TaskSummary
- `POST /task/{taskId}/complete` JSON `{variables}` -> 404 check, 204 No Content (variables viram process variables)

## Padrões arquiteturais

- **CDI**: `@ApplicationScoped`, `@Inject`, `@Named("serviceDelegate")`, `@Observes StartupEvent`
- **Delegate**: `ServiceDelegate implements JavaDelegate` registrado como `#{serviceDelegate}` no BPMN - motor/src/main/java/br/com/eyedata/bpms/delegates/ServiceDelegate.java:1 - seta variables no `DelegateExecution`
- **Deployer idempotente**: `ProcessDeployer.deployProcess()` faz `createDeployment().addClasspathResource("process.bpmn").enableDuplicateFiltering(true).deploy()` - motor/src/main/java/br/com/eyedata/bpms/ProcessDeployer.java:1
- **DTO Translator**: factories `from(Task)`, `from(ProcessDefinition)`, `from(HistoricActivityInstance)` isolam API CIB7 da serialização Jackson
- **CQRS leve**: `ActiveTaskService` (leitura) vs `TaskActionService` (escrita/claim/complete)
- **Null-safe**: `CreateProcessRequest.getVariables()` retorna `emptyMap()` se null; Resources tratam `request==null ? emptyMap()`
- **Variables**: frontend férias envia `{employeeName,email,startDate,endDate,reason,days}` (+ aliases `nome,dataInicio,dataFim,motivo`) - ver `SolicitarFeriasForm.tsx:65`

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
- Criar método em Service injetando `RuntimeService`/`TaskService`/`HistoryService`/`RepositoryService`
- Expor em `ProcessResource` ou `TaskResource` com tratamento 404/400 e `@Produces(APPLICATION_JSON)`
- Testar: `curl http://localhost:81/process/definitions`

### 3. Alterar UserTask / formData
Editar `process.bpmn` -> `RHReviewTask` / `EmployeeResponseTask`: ajustar `candidateGroups`, `assignee="${var}"`, `<camunda:formData>` fields. Frontend consome `formKey` e `taskDefinitionKey` via `TaskSummary`.

### 4. Rodar local (com Postgres)
```bash
# Subir Postgres (se não tiver)
docker run --name bpms-postgres -e POSTGRES_DB=bpms -e POSTGRES_USER=bpms -e POSTGRES_PASSWORD=bpms -p 5432:5432 -d postgres:16
# Ou usar env custom:
# DB_JDBC_URL=jdbc:postgresql://localhost:5432/meubanco mvn -pl motor quarkus:dev

mvn -pl motor quarkus:dev          # porta 81, hot reload
curl -X POST http://localhost:81/process -H "Content-Type: application/json" -d '{"variables":{"email":"ana@eyedata.com","employeeName":"Ana","startDate":"2026-09-01","endDate":"2026-09-05","reason":"Férias teste 1234567890","days":5}}'
curl http://localhost:81/task
curl http://localhost:81/process/definitions
curl http://localhost:81/process/instances/<id>/history
psql -h localhost -U bpms -d bpms -c "select proc_def_key_, start_time_ from act_hi_procinst;"
```

### 5. Build Kubernetes (kind)
```bash
mvn clean package -Dquarkus.kubernetes.deploy=true -Dquarkus.profile=kind
kind load docker-image cibseven/quarkus-motor-example:latest --name eyedata-local
kubectl rollout restart deployment motor
kubectl port-forward service/motor 8080:81
# Ver: kubectl get pods -n default; kubectl logs -l app.kubernetes.io/name=motor
```

## Dependências (motor/pom.xml)

- `org.cibseven.bpm:cibseven-engine` (2.2.0-SNAPSHOT)
- `org.cibseven.spin:cibseven-spin-core`
- `org.cibseven.bpm.quarkus:cibseven-bpm-quarkus-engine`
- `io.quarkus:quarkus-rest`, `quarkus-rest-jackson`, `quarkus-jdbc-postgresql`, `quarkus-kubernetes`, `quarkus-container-image-jib`

Removido vs docs antigos: `quarkus-jdbc-h2` (agora postgres).

## Pitfalls & checagens

- PostgreSQL obrigatório - sem `DB_CLOSE_DELAY` volátil, mas precisa container `bpms/bpms@localhost:5432`; se falhar, motor não sobe (`database-schema-update=true` cria tabelas `ACT_*`)
- Sem auth, sem paginação, sem ExceptionMapper global - erros CIB7 viram 500 com stacktrace
- Porta real 81 diverge de READMEs que citam 8080
- `process.bpmn` historyTimeToLive=1 dia - histórico expira; `history=full` necessário para `GET /history`
- Sem `src/test` no motor - `quarkus-junit5` declarado mas não usado
- Frontend férias espera `http://localhost:81` (VITE_MOTOR_URL fallback) - verificar `processos/socilitacao-ferias/frontend/src/services/motorApi.ts:9`
- Variáveis BPMN: `assignee="${email}"` - se `email` não enviado no POST, task fica sem assignee

## Verificação

Após alterar: `mvn -pl motor clean compile` e teste endpoints acima. Verifique logs do `ProcessDeployer` no startup (`Deployed process definitions: ...`) para confirmar deployment BPMN. Cheque tabelas: `psql -h localhost -U bpms -d bpms -c "\dt act_*"`
