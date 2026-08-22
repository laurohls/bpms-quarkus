---
name: bpms-quarkus-stack
description: Use when working on the overall bpms-quarkus stack - Quarkus 3.30.6, CIB Seven 2.2.0-SNAPSHOT, H2, BPMN, multi-module Maven, CORS, Kubernetes kind. Triggers on bpms-quarkus, quarkus, cibseven, camunda, H2, bpmn, kind, jib.
---

# BPMS Quarkus Stack Skill

Skill transversal que mapeia todo o repo `bpms-quarkus` e padroniza stack Quarkus + CIB Seven (fork Camunda 7) para ambos backends.

## Mapa completo do repo

```
bpms-quarkus/                          # root pom bpms-scada:1.0-SNAPSHOT
├── pom.xml                            # parent, quarkus 3.30.6, cibseven 2.2.0-SNAPSHOT, Java 17, modules=[motor]
├── motor/                             # MOTOR real - skill motor-bpms
│   ├── pom.xml                        # parent bpms-scada, deps cibseven-engine/spin/quarkus-engine + quarkus-jdbc-h2/k8s/jib
│   ├── src/main/resources/
│   │   ├── application.properties     # porta 81, H2 mem, cibseven history full, k8s
│   │   └── process.bpmn               # processo "process" linear férias
│   └── src/main/java/br/com/eyedata/bpms/ # 17 classes (ProcessDeployer, delegates, process, task, web)
├── processos/socilitacao-ferias/      # (typo mantido)
│   ├── backend/                       # STUB mock - skill solicitacao-ferias-backend
│   │   ├── pom.xml                    # solicitacao-ferias:1.0.0-SNAPSHOT standalone, porta 82
│   │   ├── src/main/resources/application.properties # só cors, sem DB/cibseven
│   │   └── src/main/java/.../HealthResource.java
│   └── frontend/                      # Vite + React 19 + bpmn-js
│       ├── package.json               # vite 8.2.0, react 19.2.8, react-router-dom 7.18.2, axios 1.19.0, bpmn-js 18.25.1
│       ├── vite.config.ts             # dev port 3002, strictPort true
│       ├── src/App.tsx                # 472 linhas monolito, view por location.pathname
│       ├── src/main.tsx               # BrowserRouter + App
│       └── src/App.css + index.css    # DS DETRAN-MS navy #0A192F blue #004F9F
└── .opencode/skills/                  # skills deste repo
    ├── motor-bpms/SKILL.md
    ├── solicitacao-ferias-backend/SKILL.md
    └── bpms-quarkus-stack/SKILL.md (este)
```

## Stack unificada

| Camada | Motor (81) | Férias Backend (82) | Frontend (3002) |
|--------|------------|---------------------|-----------------|
| Quarkus | 3.30.6 | 3.30.6 | - |
| Java | 17 | 17 | TS 6.0.2 |
| Engine | CIB Seven 2.2.0-SNAPSHOT | nenhum | - |
| DB | H2 mem process-engine | nenhum | - |
| REST | quarkus-rest + jackson | quarkus-rest + jackson | axios baseURL http://localhost:81 |
| Health | (q/health) | quarkus-smallrye-health | - |
| K8s | quarkus-kubernetes + jib | nenhum | - |
| Build | mvn quarkus:dev | mvn quarkus:dev | npm run dev (vite) |

## Configuração raiz (pom.xml)

```xml
<groupId>br.com.eyedata.bpms</groupId>
<artifactId>bpms-scada</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>pom</packaging>
<modules><module>motor</module></modules>
<properties>
  quarkus.platform.version 3.30.6
  cibseven.version 2.2.0-SNAPSHOT
  maven.compiler.release 17
</properties>
<repositories>
  maven-central
  https://artifacts.cibseven.org/repository/public
  https://artifacts.cibseven.org/repository/snapshots
</repositories>
```

## Convenções do repo

- **GroupId**: `br.com.eyedata.bpms` (motor) vs `br.com.eyedata.bpms.processo` (backend férias standalone)
- **Process key**: `"process"` em `ProcessService.PROCESS_KEY` e `process.bpmn id="process"`
- **Portas**: 81 motor, 82 stub, 3002 frontend Vite, 5173 fallback CORS
- **CORS**: ambos backends liberam `http://localhost:3002,http://127.0.0.1:3002,http://localhost:5173,http://127.0.0.1:5173` métodos GET,POST,OPTIONS
- **Frontend API**: `axios.create({baseURL: import.meta.env.VITE_API_URL || 'http://localhost:81'})` - src/App.tsx:16 - consome Motor, não stub
- **BPMN**: `camunda:` namespace mantido (compatível CIB7), `delegateExpression="#{serviceDelegate}"`, `candidateGroups="RH"`, `assignee="${email}"`
- **DTOs**: `from(Entity)` factories, `Map<String,Object> variables` null-safe com `emptyMap()`

## Frontend integração (resumo skill motor)

Frontend `src/App.tsx` consome 9 chamadas no Motor (81):
- `POST /process {variables:{employeeName,email,startDate,endDate,reason,days}}` -> `vacation daysBetween`
- `GET /task`, `GET /task/:id`, `GET /process/instances/:id/history`
- `GET /process/definitions`, `GET /process/definitions/:id/diagram` -> bpmn-js NavigatedViewer
- `POST /task/:id/claim {userId: 'ana.silva'}`, `POST /task/:id/unclaim`, `POST /task/:id/complete {variables}`
- Views por `location.pathname`: `/solicitacao-ferias/minha-fila`, `/tarefa/:id`, `/nova-solicitacao`, `/minhas-respostas`, `/processos-bpmn`

## Workflows transversais

### Rodar stack completa local
```bash
# Terminal 1 - Motor
mvn -pl motor quarkus:dev # http://localhost:81
# Terminal 2 - Stub (opcional)
mvn -f processos/socilitacao-ferias/backend/pom.xml quarkus:dev # http://localhost:82
# Terminal 3 - Frontend
cd processos/socilitacao-ferias/frontend && npm run dev # http://localhost:3002
```

### Build raiz
```bash
mvn clean compile -pl motor # só motor (único módulo aggregado)
mvn clean compile -f processos/socilitacao-ferias/backend/pom.xml # stub separado
```

### Criar fluxo férias end-to-end (via Motor)
```bash
ID=$(curl -s -X POST http://localhost:81/process -H "Content-Type: application/json" -d '{"variables":{"employeeName":"Ana Silva","email":"ana@eyedata.com","startDate":"2026-09-01","endDate":"2026-09-05","reason":"Férias","days":5}}' | jq -r .id)
curl http://localhost:81/task | jq
TASK=$(curl -s http://localhost:81/task | jq -r '.[0].id')
curl -X POST http://localhost:81/task/$TASK/claim -H "Content-Type: application/json" -d '{"userId":"rh01"}'
curl -X POST http://localhost:81/task/$TASK/complete -H "Content-Type: application/json" -d '{"variables":{"rhDecision":"APPROVED","rhResponse":"ok"}}'
curl http://localhost:81/process/instances/$ID/history | jq
```

### Adicionar novo processo BPMN (padrão repo)
1. Modelar no Camunda Modeler (exporter 5.34.0), salvar como `src/main/resources/meu-processo.bpmn` (ou novo recurso em `processos/.../backend`)
2. Registrar em `ProcessDeployer`: `.addClasspathResource("meu-processo.bpmn")`
3. Criar delegate `@Named` se precisar service task
4. Expor `GET /process/definitions` já lista automaticamente `latestVersion`

## Repositórios CIB Seven

```xml
<repository><id>mvn-cibseven-public</id><url>https://artifacts.cibseven.org/repository/public</url></repository>
<repository><id>mvn-cibseven-snapshots</id><url>https://artifacts.cibseven.org/repository/snapshots</url></repository>
```
CIB Seven = fork comunitário Camunda 7 após EOL. API idêntica, groupId `org.cibseven.bpm`, mantém compatibilidade `camunda:` no BPMN.

## Pitfalls globais

- `processos/socilitacao-ferias` tem typo `socilitacao` (sem vírgula) - preservar em paths/scripts
- Root pom não agrega `processos/socilitacao-ferias/backend` - builds separados
- H2 volátil, sem auth, sem paginação, sem ExceptionMapper
- Frontend monolito `App.tsx` 472 linhas sem `Routes` declarativo (location.pathname manual)
- `target/` contém bytecode stale `org.cibseven.ferias.ProcessResource` desatualizado após rename
- Portas documentadas em READMEs (8080) divergem de `application.properties` (81/82)

## Verificação stack
```bash
mvn -pl motor clean compile
mvn -f processos/socilitacao-ferias/backend/pom.xml clean test
cd processos/socilitacao-ferias/frontend && npm run build # tsc -b + vite build
curl http://localhost:81/q/health; curl http://localhost:82/q/health
```

## Escolha de skill
- Editando Motor (BPMN, delegates, /process, /task, H2, K8s) -> `motor-bpms`
- Editando stub férias (HealthResource, mock UUID, porta 82) -> `solicitacao-ferias-backend`
- Dúvida de arquitetura, portas, integração frontend-motor, ou novo módulo -> esta skill `bpms-quarkus-stack`
