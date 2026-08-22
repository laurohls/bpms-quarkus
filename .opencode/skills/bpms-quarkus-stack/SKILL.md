---
name: bpms-quarkus-stack
description: Use when working on the overall bpms-quarkus stack - Quarkus 3.30.6, CIB Seven 2.2.0-SNAPSHOT, PostgreSQL, H2 fallback, BPMN, multi-module Maven, CORS, Kubernetes kind, frontend master. Triggers on bpms-quarkus, quarkus, cibseven, camunda, postgres, bpmn, kind, jib.
---

# BPMS Quarkus Stack Skill

Skill transversal que mapeia todo o repo `bpms-quarkus` e padroniza stack Quarkus + CIB Seven (fork Camunda 7) para todos os projetos.

## Mapa completo do repo

```
bpms-quarkus/                          # root pom bpms-scada:1.0-SNAPSHOT
├── pom.xml                            # parent, quarkus 3.30.6, cibseven 2.2.0-SNAPSHOT, Java 17, modules=[motor]
├── motor/                             # MOTOR real - skill motor-bpms (porta 81)
│   ├── pom.xml                        # parent bpms-scada, deps cibseven-engine/spin/quarkus-engine + quarkus-jdbc-postgresql + k8s/jib
│   ├── src/main/resources/
│   │   ├── application.properties     # porta 81, PostgreSQL localhost:5432/bpms, history full, k8s Never
│   │   └── process.bpmn               # processo "process" linear férias
│   └── src/main/java/br/com/eyedata/bpms/ # 17 classes (ProcessDeployer, delegates, process, task, web)
├── modulos/
│   └── frontend/                      # MASTER TEMPLATE LIB - skill frontend-master (porta 3002)
│       ├── package.json               # bpms-frontend-master 1.0.0, vite 8.2.0, react 19.2.8, router 7.18.2, axios 1.19.0, bpmn-js 18.25.1
│       ├── vite.config.ts             # dev port 3002, strictPort false
│       ├── src/App.tsx                # re-exports TUDO + DemoApp (128 linhas)
│       ├── src/components/Layout.tsx  # Sidebar, PageHeader, AppFooter
│       ├── src/contexts/UserContext.tsx # CurrentUserProvider, BPMS_USERS (admin/gestor/user)
│       ├── src/services/api.ts        # apiClient (axios, VITE_API_URL || 8080/api)
│       ├── src/hooks/index.ts         # useApi, useMutation, useLocalStorage, useDebounce
│       ├── src/types/index.ts         # User, RouteConfig, ProjectRoutes, ApiResponse
│       └── src/utils/routeLoader.ts   # loadProjectRoutes, buildMenuFromRoutes, flattenMenu
├── processos/socilitacao-ferias/      # (typo socilitacao preservado)
│   ├── backend/                       # STUB mock - skill solicitacao-ferias-backend (porta 82)
│   │   ├── pom.xml                    # solicitacao-ferias:1.0.0-SNAPSHOT standalone, quarkus-rest + health
│   │   ├── src/main/resources/application.properties # só cors, sem DB/cibseven
│   │   └── src/main/java/.../HealthResource.java # GET /health -> {status:UP}
│   └── frontend/                      # PROCESSO FÉRIAS - skill solicitacao-ferias-frontend (porta 3002)
│       ├── package.json               # bpms-solicitacao-ferias 1.0.0, deps bpms-frontend-master=file:../../modulos/frontend
│       ├── vite.config.ts             # alias bpms-frontend-master -> src/vendor/master, port 3002 strictPort true
│       ├── src/routes.json            # 5 rotas: /atividades, /solicitar, /minhas-respostas, /processos, /tarefa/:id
│       ├── src/App.tsx                # 157 linhas, COMPONENT_MAP + Routes dinâmicas
│       ├── src/services/motorApi.ts   # motorApi (VITE_MOTOR_URL || VITE_API_URL || localhost:81)
│       ├── src/types/index.ts         # VacationFormData, SolicitacaoFerias, Task, RhAnalysisData...
│       ├── src/components/forms/      # 4 forms: SolicitarFerias, AnalisarSolicitacao, ValidarGestor, CancelarFerias
│       ├── src/components/views/      # 6 views: SolicitarFerias, TaskList, TaskDetail, MinhasSolicitacoes, Processos, AnalisarFerias
│       └── src/vendor/master/         # cópia vendorizada do master (Layout, UserContext, api, etc)
└── .opencode/skills/                  # skills deste repo
    ├── bpms-quarkus-stack/SKILL.md (este)
    ├── motor-bpms/SKILL.md
    ├── frontend-master/SKILL.md
    ├── solicitacao-ferias-backend/SKILL.md
    └── solicitacao-ferias-frontend/SKILL.md
```

## Stack unificada

| Camada | Motor (81) | Férias Backend (82) | Master Frontend | Férias Frontend (3002) |
|--------|------------|---------------------|-----------------|------------------------|
| Quarkus | 3.30.6 | 3.30.6 | - | - |
| Java | 17 | 17 | TS 6.0.2 | TS 6.0.2 |
| Engine | CIB Seven 2.2.0-SNAPSHOT | nenhum | - | - |
| DB | PostgreSQL `bpms` localhost:5432 | nenhum | - | - |
| REST | quarkus-rest + jackson | quarkus-rest + jackson | axios | axios (motorApi) |
| Health | q/health | quarkus-smallrye-health | - | - |
| K8s | quarkus-kubernetes + jib (cibseven/quarkus-motor-example) | nenhum | nginx | nginx |
| Build | mvn quarkus:dev | mvn quarkus:dev | npm run dev (vite 3002) | npm run dev (vite 3002) |
| Alias | - | - | `bpms-frontend-master` | vendor/master local |

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

- **GroupId**: `br.com.eyedata.bpms` (motor) vs `br.com.eyedata.bpms.processo` (backend férias standalone) vs `bpms-frontend-master` (npm)
- **Process key**: `"process"` em `ProcessService.PROCESS_KEY` e `process.bpmn id="process"`
- **Portas**: 81 motor, 82 stub, 3002 master e férias frontend (strictPort true no férias), 5173 fallback CORS
- **CORS**: motor libera `3002,3003,5173` (PUT/DELETE inclusos) + `Authorization`; stub só `3002,5173` (GET/POST/OPTIONS)
- **DB Motor**: PostgreSQL `jdbc:postgresql://localhost:5432/bpms` com env `DB_USERNAME/BPMS`, `DB_PASSWORD/BPMS`, `DB_JDBC_URL`
- **Frontend API**: master `VITE_API_URL || http://localhost:8080/api` (genérico) vs férias `VITE_MOTOR_URL || VITE_API_URL || http://localhost:81` (motorApi)
- **BPMN**: `camunda:` namespace mantido (compatível CIB7), `delegateExpression="#{serviceDelegate}"`, `candidateGroups="RH"`, `assignee="${email}"`
- **DTOs**: `from(Entity)` factories, `Map<String,Object> variables` null-safe com `emptyMap()`
- **Vendor**: férias frontend vendoriza master em `src/vendor/master/` + alias vite; master real em `modulos/frontend/src/`

## Workflows transversais

### Rodar stack completa local
```bash
# Terminal 1 - Motor (precisa Postgres rodando)
docker run --name bpms-postgres -e POSTGRES_DB=bpms -e POSTGRES_USER=bpms -e POSTGRES_PASSWORD=bpms -p 5432:5432 -d postgres:16
mvn -pl motor quarkus:dev # http://localhost:81

# Terminal 2 - Stub (opcional)
mvn -f processos/socilitacao-ferias/backend/pom.xml quarkus:dev # http://localhost:82

# Terminal 3 - Frontend Master (demo)
cd modulos/frontend && npm run dev # http://localhost:3002

# Terminal 4 - Frontend Férias (real)
cd processos/socilitacao-ferias/frontend && npm run dev # http://localhost:3002 (conflita com master, usar portas diferentes ou rodar um por vez)
```

### Build raiz
```bash
mvn clean compile -pl motor # só motor (único módulo aggregado)
mvn clean compile -f processos/socilitacao-ferias/backend/pom.xml # stub separado
cd modulos/frontend && npm run build # tsc -b + vite build -> dist/
cd processos/socilitacao-ferias/frontend && npm run build # vite build -> dist/
```

### Criar fluxo férias end-to-end (via Motor)
```bash
ID=$(curl -s -X POST http://localhost:81/process -H "Content-Type: application/json" -d '{"variables":{"employeeName":"Ana Silva","email":"ana@eyedata.com","startDate":"2026-09-01","endDate":"2026-09-05","reason":"Férias 2026 teste minimo 10 chars","days":5}}' | jq -r .id)
curl http://localhost:81/task | jq
TASK=$(curl -s http://localhost:81/task | jq -r '.[0].id')
curl -X POST http://localhost:81/task/$TASK/claim -H "Content-Type: application/json" -d '{"userId":"rh01"}'
curl -X POST http://localhost:81/task/$TASK/complete -H "Content-Type: application/json" -d '{"variables":{"rhDecision":"APPROVED","rhResponse":"ok"}}'
curl http://localhost:81/process/instances/$ID/history | jq
```

### Adicionar novo processo BPMN (padrão repo)
1. Modelar no Camunda Modeler (exporter 5.34.0), salvar como `src/main/resources/meu-processo.bpmn`
2. Registrar em `ProcessDeployer`: `.addClasspathResource("meu-processo.bpmn")`
3. Criar delegate `@Named` se precisar service task
4. Expor `GET /process/definitions` já lista automaticamente `latestVersion`

### Criar novo projeto frontend (padrão master)
1. Copiar `modulos/frontend` ou usar `processos/socilitacao-ferias/frontend` como template
2. Criar `src/routes.json` com `basePath` + `routes[]` (name, path, component, icon)
3. Criar `src/components/forms/` e `views/` específicos
4. Configurar `vite.config.ts` alias `bpms-frontend-master -> src/vendor/master`
5. Mapear `COMPONENT_MAP` em `App.tsx`

## Repositórios CIB Seven

```xml
<repository><id>mvn-cibseven-public</id><url>https://artifacts.cibseven.org/repository/public</url></repository>
<repository><id>mvn-cibseven-snapshots</id><url>https://artifacts.cibseven.org/repository/snapshots</url></repository>
```
CIB Seven = fork comunitário Camunda 7 após EOL. API idêntica, groupId `org.cibseven.bpm`, mantém compatibilidade `camunda:` no BPMN.

## Pitfalls globais

- `processos/socilitacao-ferias` tem typo `socilitacao` (sem 'i') - preservar em paths/scripts
- Root pom não agrega `processos/socilitacao-ferias/backend` nem frontends - builds separados
- Motor agora usa PostgreSQL (não H2 mem) - precisa `docker run postgres:16` ou env `DB_JDBC_URL`
- Sem auth, sem paginação, sem ExceptionMapper global - erros CIB7 viram 500
- Frontend master vs férias ambos na porta 3002 - não rodar simultaneamente sem mudar porta
- Férias frontend vendoriza master (`src/vendor/master`) - atualizar manualmente se master mudar
- `target/` pode conter bytecode stale após rename - sempre `mvn clean`
- Portas documentadas em READMEs (8080) divergem de `application.properties` (81/82)

## Verificação stack

```bash
mvn -pl motor clean compile
mvn -f processos/socilitacao-ferias/backend/pom.xml clean test
cd modulos/frontend && npm run build # tsc -b + vite build
cd processos/socilitacao-ferias/frontend && npm run build # vite build
curl http://localhost:81/q/health; curl http://localhost:82/q/health
psql -h localhost -U bpms -d bpms -c "select id_, proc_def_key_ from act_hi_procinst limit 5;"
```

## Escolha de skill

- Motor (BPMN, delegates, /process, /task, Postgres, K8s) -> `motor-bpms`
- Master Template (Layout, apiClient, hooks, types, routeLoader) -> `frontend-master`
- Stub férias (HealthResource, mock, porta 82) -> `solicitacao-ferias-backend`
- Frontend Férias (routes.json, motorApi, forms/views, vendor) -> `solicitacao-ferias-frontend`
- Dúvida de arquitetura, portas, integração, ou novo módulo -> esta skill `bpms-quarkus-stack`
