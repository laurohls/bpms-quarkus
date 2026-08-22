# Plano: BPMS Quarkus com CIB seven e PostgreSQL (Docker)

## TL;DR

**O quê:** Containerizar e orquestrar uma plataforma BPMS baseada no motor CIB seven (fork do Camunda 7), com backend Quarkus, frontend React/TypeScript, persistência PostgreSQL, e atalhos CLI Windows via `.bat`.

**Por quê:** Permitir ambiente reprodutível, escalável e pronto para produção para gerenciar processos administrativos (férias, aprovações, etc.) via BPMN com API REST e UI moderna.

**Como:** Docker Compose + PostgreSQL + Motor CIB seven configurado com JDBC + Dockerfiles multi-stage para backend/frontend + script `.bat` para orquestração simples.

---

## Status Atual (✓ Implementado)

### ✓ Master Frontend (Novo)
- [modulos/frontend](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend) — projeto master com layout padrão
- [App.tsx](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/src/App.tsx) — componentes genéricos (Sidebar, PageHeader, CurrentUserProvider)
- [App.css](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/src/App.css) — estilos base com CSS variables
- [HERANCA.md](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/HERANCA.md) — guia de herança para novos módulos
- [QUICKSTART.md](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/QUICKSTART.md) — guia rápido
- Dockerfile + nginx.conf + vite.config.ts + tsconfig + package.json
- **Propósito:** Todas as frontends BPMS herdam daqui (layout, componentes, estilos)

### ✓ Infraestrutura Docker
- [docker-compose.yml](C:/Projetos/Pessoal/bpms-quarkus/docker-compose.yml) — orquestra PostgreSQL, motor, backend-férias, frontend-férias
- [.dockerignore](C:/Projetos/Pessoal/bpms-quarkus/.dockerignore) — limpa contexto de build
- Volumes persistentes para PostgreSQL com healthcheck

### ✓ Motor CIB seven (Quarkus)
- [motor/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/motor/Dockerfile) — multi-stage Maven → JRE 17
- [motor/pom.xml](C:/Projetos/Pessoal/bpms-quarkus/motor/pom.xml) — driver PostgreSQL (`quarkus-jdbc-postgresql`)
- [motor/src/main/resources/application.properties](C:/Projetos/Pessoal/bpms-quarkus/motor/src/main/resources/application.properties) — datasource com env vars (`DB_JDBC_URL`, `DB_USERNAME`, `DB_PASSWORD`)
- Schema CIB seven auto-criado em PostgreSQL via `databaseSchemaUpdate=true`
- Endpoints REST: `/task`, `/process`, `/process/definitions/*`, `/process/instances/*/history`

### ✓ Backend Férias (Quarkus)
- [processos/socilitacao-ferias/backend/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/backend/Dockerfile) — multi-stage Maven → JRE 17
- Health endpoint: `GET /health` → `{"status":"UP","service":"solicitacao-ferias-backend"}`
- Porta: 82

### ✓ Frontend Férias (React + TypeScript + Nginx)
- [processos/socilitacao-ferias/frontend/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/Dockerfile) — serve `dist` em Nginx
- [processos/socilitacao-ferias/frontend/nginx.conf](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/nginx.conf) — SPA fallback (`try_files $uri /index.html`)
- Porta: 3002
- **Nota:** Erros TypeScript pré-existentes em App.tsx; frontend serve `dist` compilado

### ✓ Script Atalho Windows
- [docker-projetos.bat](C:/Projetos/Pessoal/bpms-quarkus/docker-projetos.bat) — comandos não-interativos
  - `up`, `up-build`, `down`, `build`, `restart`, `logs`, `ps`, `pull`, `clean`, `help`

### ✓ Documentação
- [README.md](C:/Projetos/Pessoal/bpms-quarkus/README.md) — atualizado com Docker Compose e atalho `.bat`
- [motor/README.md](C:/Projetos/Pessoal/bpms-quarkus/motor/README.md) — ports 81 → 81, datasource PostgreSQL
- [processos/socilitacao-ferias/frontend/README.md](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/README.md) — motor na porta 81

### ✓ Validação
- Stack composto com `docker compose up -d` → todos 4 serviços rodando
- Motor conectado e criando schema PostgreSQL
- Endpoints HTTP respondendo: motor (81), backend (82), frontend (3002)

---

## Próximas Etapas Recomendadas

### ✓ Fase 0: Master Frontend (IMPLEMENTADO)
**Meta:** Criar template padrão reutilizável para todos os módulos.

1. **✓ Criar [modulos/frontend](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend)** — projeto master com layout genérico
2. **✓ Componentes base** — Sidebar, PageHeader, CurrentUserProvider, MainContent
3. **✓ Estilos padrão** — App.css com tema consistente (cores, tipografia, responsive)
4. **✓ Documentação** — README.md, HERANCA.md, QUICKSTART.md com guias de herança
5. **✓ Infraestrutura** — Dockerfile, nginx.conf, vite.config.ts, tsconfig
6. **Verificação:** Master frontend validado; pronto para herança por outros módulos

### Fase 1: Migrar Férias para Herdar Master (High Priority)
**Meta:** Fazer `processos/socilitacao-ferias/frontend` herdar layout do master.

1. **Aplicar guia [MIGRACAO_FERIAS.md](C:/Projetos/Pessoal/bpms-quarkus/MIGRACAO_FERIAS.md)** — copiar estrutura base do master
2. **Refatorar [App.tsx](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/src/App.tsx)** — herdar layout, mover lógica para componentes
3. **Organizar componentes** — VacationForm.tsx, TaskList.tsx, ProcessViewer.tsx em src/components/
4. **Estender estilos** — App.css importa/reutiliza tema do master
5. **Validar integração** — testar com motor, docker-compose
6. **Verificação:** Férias usa layout do master; funcionalidades preservadas

### Fase 2: Correção Frontend TypeScript (Medium Priority)
**Meta:** Resolver erros TypeScript após migração.

1. **Revisar tipos** — ajustar interfaces em componentes de férias
2. **Validar build** — `npm run build` sem erros
3. **Testar em Docker** — Dockerfile build bem-sucedido
4. **Verificação:** Frontend compilado sem erros; página carrega em `http://localhost:3002`

### Fase 3: Integração End-to-End (High Priority)
**Meta:** Validar fluxo completo: UI → Motor → BD.

1. **Teste manual:** Criar instância de processo via frontend → verificar em motor (`GET /process/instances`)
2. **Teste de tarefa:** Listar tarefas → assumir → completar → histórico atualizado
3. **Persistência:** Reiniciar containers → dados permanecem em PostgreSQL
4. **Verificação:** All workflow steps tested; data survives restart

### Fase 4: Documentação de Deploy (Medium Priority)
**Meta:** Guia claro para deploy em produção.

1. **Variáveis de ambiente** — documental necessárias por serviço (ex: `DB_JDBC_URL`, CORS, portas)
2. **Health checks** — endpoints e logs esperados na inicialização
3. **Backup PostgreSQL** — strategy para `bpms-postgres-data` volume
4. **Referência:** Docs/DEPLOY.md com checklist pré-go-live

### Fase 5: Exemplos Adicionais de Processos (Medium Priority)
**Meta:** Além de férias, criar templates para outros processos administrativos.

1. **Scaffold novo processo** — ex: "Solicitação de Férias" → "Aprovação de Despesas"
2. **BPMN reutilizável** — patterns para task humanae, decisões, notificações
3. **Backend Quarkus genérico** — abstrair lógica de API para health + process start
4. **Referência:** Diretório `processos/` com múltiplos exemplos

### Fase 5: Autenticação e Autorização (Low Priority)
**Meta:** Integrar segurança básica (JWT, OAuth2 ou LDAP).

1. **Avaliar** — Quarkus OIDC vs. CIB seven built-in authorization
2. **Implementar** — autenticação na porta de entrada (frontend → motor)
3. **Testar** — claims/roles controlar acesso a tarefas
4. **Referência:** Docs de authz + testes E2E

---

## Arquitetura em Execução

```
┌─────────────────────────────────────────────────────┐
│          Docker Compose Network (default)            │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐    ┌──────────────┐               │
│  │  nginx       │    │  Quarkus     │               │
│  │  frontend    │    │  backend     │               │
│  │  :80→3002    │    │  :82         │               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                   │                        │
│         └───────┬───────────┘                        │
│                 │                                    │
│         ┌───────▼──────────┐                        │
│         │  Quarkus motor   │                        │
│         │  CIB seven       │                        │
│         │  :81             │                        │
│         └────────┬─────────┘                        │
│                  │                                  │
│         ┌────────▼──────────┐                       │
│         │   PostgreSQL      │                       │
│         │   :5432           │                       │
│         │   (volume persist)│                       │
│         └───────────────────┘                       │
└─────────────────────────────────────────────────────┘

Host:
  docker-projetos.bat → docker compose CLI commands
```

---

## Arquivos-Chave para Referência

| Arquivo | Propósito |
|---------|-----------|
| [modulos/frontend/src/App.tsx](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/src/App.tsx) | **NOVO** Componentes base (layout master) |
| [modulos/frontend/src/App.css](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/src/App.css) | **NOVO** Estilos padrão para todos os módulos |
| [modulos/frontend/HERANCA.md](C:/Projetos/Pessoal/bpms-quarkus/modulos/frontend/HERANCA.md) | **NOVO** Guia: como herdar o layout |
| [MIGRACAO_FERIAS.md](C:/Projetos/Pessoal/bpms-quarkus/MIGRACAO_FERIAS.md) | **NOVO** Checklist: migrar férias para usar master |
| [docker-compose.yml](C:/Projetos/Pessoal/bpms-quarkus/docker-compose.yml) | Orquestração completa |
| [motor/pom.xml](C:/Projetos/Pessoal/bpms-quarkus/motor/pom.xml) | Dependências motor (CIB seven + PostgreSQL) |
| [motor/src/main/resources/application.properties](C:/Projetos/Pessoal/bpms-quarkus/motor/src/main/resources/application.properties) | Configuração JDBC/datasource/history |
| [motor/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/motor/Dockerfile) | Build + runtime motor |
| [processos/socilitacao-ferias/backend/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/backend/Dockerfile) | Backend férias containerizado |
| [processos/socilitacao-ferias/frontend/Dockerfile](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/Dockerfile) | Frontend Nginx |
| [processos/socilitacao-ferias/frontend/nginx.conf](C:/Projetos/Pessoal/bpms-quarkus/processos/socilitacao-ferias/frontend/nginx.conf) | SPA routing config |
| [docker-projetos.bat](C:/Projetos/Pessoal/bpms-quarkus/docker-projetos.bat) | CLI atalho (Windows) |

---

## Checklist Verificação Imediata

```bash
# Listar containers
docker-projetos.bat ps

# Logs motor (PostgreSQL init)
docker-projetos.bat logs motor

# Verificar endpoints
curl -s http://localhost:81/task
curl -s http://localhost:82/health
# Verificar frontend
http://localhost:3002
```

---

## Decisões Registradas

1. **PostgreSQL em vez de MongoDB** — Motor CIB seven requer JDBC; MongoDB não suportado nativamente
2. **Multi-stage Dockerfiles** — Otimiza tamanho de imagem; Maven/Node apenas em build, não em runtime
3. **Frontend sem rebuild no Dockerfile** — Erros TS pré-existentes; serve `dist` compilado
4. **Docker Compose em vez de Kubernetes** — Simples, local-first, pronto para dev e pequenos deploys
5. **`.bat` não-interativo** — Cada comando executa e retorna, permitindo scripts/CI/CD

---

## Observações e Restrições

- **Frontend erros TypeScript:** App.tsx tem tipos incompatíveis (ex: `task` não existe em `TaskDetails`). Build Node bloqueado até correção.
- **Teste manual recomendado:** Não há testes automatizados end-to-end; validar fluxo completo manualmente antes de usar em produção.
- **Scaling:** Docker Compose adequado para dev/test; Kubernetes recomendado para produção multi-nó.
- **Secrets:** Credenciais de BD em `docker-compose.yml` com defaults (`bpms`/`bpms`); usar `.env` ou vault em produção.

---

## Próximos Passos Imediatos (Recomendado)

1. **Testar Master Frontend** (10min)
   ```bash
   cd modulos/frontend
   npm install
   npm run dev
   # Acesse http://localhost:3002 — veja o layout genérico funcionando
   ```

2. **Migrar Férias para herdar Master** (2-3h)
   - Seguir [MIGRACAO_FERIAS.md](C:/Projetos/Pessoal/bpms-quarkus/MIGRACAO_FERIAS.md)
   - Refatorar App.tsx, organizar componentes
   - Validar docker build
   
3. **Teste E2E de Férias** (30min)
   - Criar processo → listar tarefa → completar
   - Verificar dados em PostgreSQL
   - Validar integração motor ↔ frontend

4. **Preparar Novo Módulo** (ex: Despesas) (1h)
   - Copiar estrutura de `modulos/frontend`
   - Adicionar lógica específica
   - Integrar com docker-compose
