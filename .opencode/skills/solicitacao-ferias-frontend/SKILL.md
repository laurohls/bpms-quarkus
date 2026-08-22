---
name: solicitacao-ferias-frontend
description: Use when working on the Solicitação de Férias frontend at processos/socilitacao-ferias/frontend - Vite + React 19, routes.json, motorApi, forms/views, vendor master. Triggers on socilitacao-ferias frontend, SolicitarFeriasForm, TaskListView, motorApi, routes.json, VITE_MOTOR_URL, solicitacao-ferias.
---

# Solicitação de Férias Frontend Skill

Frontend específico do processo de férias - **Vite 8 + React 19 + TypeScript 6 + React Router 7**. Herda do master via `bpms-frontend-master` (vendor + alias). Consome **Motor 81** via `motorApi`. Porta **3002** (strictPort true).

## Quando usar

Use esta skill quando:
- Editar `processos/socilitacao-ferias/frontend/src/routes.json` (rotas)
- Alterar `src/App.tsx` (COMPONENT_MAP, Routes dinâmicas)
- Criar/editar forms em `src/components/forms/` (SolicitarFerias, AnalisarSolicitacao, ValidarGestor, CancelarFerias, ConsultarResposta)
- Criar/editar views em `src/components/views/` (SolicitarFerias, TaskList, TaskDetail, MinhasSolicitacoes, Processos, AnalisarFerias)
- Modificar `src/services/motorApi.ts` (cliente Motor 81) ou `src/types/index.ts`
- Ajustar `vite.config.ts` (alias), `src/vendor/master/` (cópia master), CSS, `utils/dateHelpers.ts`

## Estrutura de referência

```
processos/socilitacao-ferias/frontend/
├── package.json          # name bpms-solicitacao-ferias 1.0.0, deps bpms-frontend-master=file:../../modulos/frontend, axios, bpmn-js, react 19, router 7
├── vite.config.ts        # processos/socilitacao-ferias/frontend/vite.config.ts:1 - alias bpms-frontend-master -> src/vendor/master, port 3002 strictPort true
├── index.html + nginx.conf + Dockerfile + .env
├── public/ + dist/
└── src/
    ├── App.tsx           # processos/socilitacao-ferias/frontend/src/App.tsx:1 - 157 linhas, COMPONENT_MAP, AppLayout, loadProjectRoutes
    ├── App.css + index.css
    ├── main.tsx          # BrowserRouter + App
    ├── routes.json       # processos/socilitacao-ferias/frontend/src/routes.json:1 - 5 rotas
    ├── bpmn-js.d.ts + vite-env.d.ts
    ├── assets/ (hero.png, react.svg)
    ├── components/
    │   ├── forms/        # 5 forms: SolicitarFeriasForm, AnalisarSolicitacaoForm, ValidarGestorForm, CancelarFeriasForm, ConsultarRespostaForm
    │   ├── views/        # 6 views: SolicitarFeriasView, TaskListView, TaskDetailView, MinhasSolicitacoesView, ProcessosView, AnalisarFeriasView
    │   └── shared/       # TaskCard.tsx
    ├── services/
    │   └── motorApi.ts   # processos/socilitacao-ferias/frontend/src/services/motorApi.ts:1 - MotorApiClient localhost:81
    ├── types/
    │   └── index.ts      # processos/socilitacao-ferias/frontend/src/types/index.ts:1 - VacationFormData, Task, RhAnalysisData...
    ├── utils/
    │   └── dateHelpers.ts # daysBetween, formatters
    └── vendor/
        └── master/       # cópia vendorizada de modulos/frontend/src/ (Layout, UserContext, api, hooks, types, utils, App.css)
```

## Configuração

### package.json
```json
{
  "name": "bpms-solicitacao-ferias", "version": "1.0.0", "type": "module",
  "dependencies": { "bpms-frontend-master": "file:../../modulos/frontend", "axios":"^1.19.0", "bpmn-js":"^18.25.1", "react":"^19.2.8", "react-router-dom":"^7.18.2" },
  "scripts": { "dev":"vite", "build":"vite build", "lint":"oxlint", "preview":"vite preview", "type-check":"tsc --noEmit" }
}
```

### vite.config.ts - processos/socilitacao-ferias/frontend/vite.config.ts:1
```typescript
import path from 'path'
export default defineConfig({
  plugins:[react()],
  resolve:{ alias:{ 'bpms-frontend-master': path.resolve(__dirname, './src/vendor/master') } },
  server:{ host:'localhost', port:3002, strictPort:true }
})
```
Alias resolve `bpms-frontend-master` para `src/vendor/master` (não symlink `modulos/frontend` direto - evita HMR issues).

### .env (opcional)
```
VITE_MOTOR_URL=http://localhost:81
VITE_API_URL=http://localhost:81  # fallback
```

## Roteamento (routes.json) - processos/socilitacao-ferias/frontend/src/routes.json:1

```json
{
  "basePath": "/processos/socilitacao-ferias",
  "routes": [
    { "name": "Atividades", "path": "/atividades", "component": "TaskListView", "icon": "◈" },
    { "name": "Nova Solicitação", "path": "/solicitar", "component": "SolicitarFeriasView", "icon": "＋" },
    { "name": "Minhas Respostas", "path": "/minhas-respostas", "component": "MinhasSolicitacoesView", "icon": "✓" },
    { "name": "Processos BPMN", "path": "/processos", "component": "ProcessosView", "icon": "⌘" },
    { "name": "_tarefa", "path": "/tarefa/:id", "component": "TaskDetailView", "icon": "_" }
  ]
}
```
- `basePath` não é usado para prefixar navegação em `App.tsx:67` (`navigate('/'+route.path)`) - é metadado
- `icon: "_"` e `name: "_tarefa"` indica rota interna - `buildMenuFromRoutes` filtra `path.startsWith('_')` se usado, mas `App.tsx` renderiza todas (Sidebar mostra até `_tarefa` - considerar filtrar)
- `component` deve existir em `COMPONENT_MAP` (`App.tsx:40`)

### App.tsx - processos/socilitacao-ferias/frontend/src/App.tsx:1

```typescript
const COMPONENT_MAP: Record<string, Component> = {
  SolicitarFeriasView, TaskListView, TaskDetailView, MinhasSolicitacoesView, ProcessosView, AnalisarFeriasView,
  AnalisarSolicitacaoForm, ValidarGestorForm, CancelarFeriasForm, ConsultarRespostaForm
}
function AppLayout({ routes }: { routes: ProjectRoutes }) {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <Sidebar> {routes.routes.map(route => <button onClick={()=>navigate('/'+route.path)}> {route.icon} {route.name} </button>)} </Sidebar>
      <main className="main-content">
        <PageHeader title="Solicitação de Férias" subtitle="DETRAN-MS · Sistema BPMS" />
        <Routes> {routes.routes.map(route => <Route path={route.path.startsWith('/')?route.path:'/'+route.path} element={<Component/>} />)} </Routes>
      </main>
    </div>
    <AppFooter/>
  )
}
export default function App() {
  const [routes,setRoutes] = useState<ProjectRoutes|null>(null)
  useEffect(()=>{ loadProjectRoutes('/routes.json').then(setRoutes) },[])
  return <CurrentUserProvider><AppLayout routes={routes}/></CurrentUserProvider>
}
```
- `loadProjectRoutes('/routes.json')` busca de `public/` ou `src/` (Vite serve como static)
- `PageHeader` hardcoded "Solicitação de Férias" - não vem de routes
- `vendor/master/index.css + App.css` importados antes de `App.css` local

## Services

### motorApi.ts - processos/socilitacao-ferias/frontend/src/services/motorApi.ts:1
```typescript
const MOTOR_BASE_URL = import.meta.env.VITE_MOTOR_URL || import.meta.env.VITE_API_URL || 'http://localhost:81'
class MotorApiClient {
  client = axios.create({ baseURL: MOTOR_BASE_URL, headers:{'Content-Type':'application/json'} })
  // interceptor Authorization: Bearer bpms.authToken
  async get<T>(path): Promise<T> { return (await client.get<T>(path)).data }
  async post<T>(path,payload): Promise<T> { ... }
  async put<T>(path,payload): Promise<T> { ... }
  async delete<T>(path): Promise<T> { ... }
}
export const motorApi = new MotorApiClient()
```
Diferença vs `apiClient` master: retorna `T` direto (não `ApiResponse<T>`), sem try/catch `success:false`.

**Uso real** (SolicitarFeriasForm.tsx:74): `motorApi.post('/process', { variables: { employeeName,email,startDate,endDate,reason,days, nome, dataInicio, dataFim, motivo } })`

Outros usos:
- `TaskListView`: `motorApi.get('/task')`
- `TaskDetailView`: `motorApi.get('/task/:id')`, `post('/task/:id/claim|unclaim|complete')`
- `ProcessosView`: `motorApi.get('/process/definitions')`, `get('/process/definitions/:id/diagram')` -> bpmn-js NavigatedViewer
- `MinhasSolicitacoesView`: `motorApi.get('/process/instances/:id/history')`

## Types - processos/socilitacao-ferias/frontend/src/types/index.ts:1

```typescript
type VacationFormData = { employeeName, email, startDate, endDate, reason, departamento?, cargo? }
type VacationRequest = { id, usuarioId, dataInicio, dataFim, motivo, status: 'solicitado'|'pendente-gestor'|'pendente-rh'|'aprovado'|'rejeitado'|'cancelado', dataSolicitacao, ... }
type SolicitacaoFerias = { id, nomeFuncionario, emailFuncionario, matricula, departamento, dataInicio, dataFim, diasSolicitados, motivo?, status }
type Task = { id, name, assignee?, processInstanceId, taskDefinitionKey?, createTime?, processDefinitionName? }
type TaskDetails = Task & { processInstance?:{id,processDefinitionKey}, processVariables?, taskVariables? }
type ProcessDefinition = { id, key, name?, version, deploymentId? }
type Activity = { id, activityId?, activityName?, activityType?, startTime?, endTime? }
type RhAnalysisData = { parecer:'aprovado'|'rejeitado'|'condicional', saldoDisponivelAnual, diasSolicitados, ... }
type GestorValidationData = { viabilidade:'viavel'|'condicional'|'nao-viavel', impactoOperacional, equipeDisponivel, ... }
```

## Forms & Views

### SolicitarFeriasForm.tsx - 196 linhas
- State `formData: VacationFormData` + `loading/error/success`
- `validateForm()`: `employeeName.length>=3`, `email` não vazio, `startDate/endDate` required, `endDate>=startDate`, `reason.length>=10`
- `handleSubmit`: `days = daysBetween(startDate,endDate)` (utils/dateHelpers), `variables = {...formData, days, nome, dataInicio, dataFim, motivo}` -> `motorApi.post('/process', {variables})` -> reset + `navigate('/atividades')` após 2s
- UI: `form-group`, `form-input/textarea`, `form-row` com `dias-badge`, `alert-success/error`, `btn-primary` disabled loading

### SolicitarFeriasView.tsx - 41 linhas
Wrapper com `PageHeader title="Nova Solicitação de Férias"` + `view-instructions` ol 5 passos + `<SolicitarFeriasForm/>` + `view-footer` nota "2 dias úteis"

### Outras views (resumo)
- `TaskListView`: lista `GET /task`, exibe `TaskCard`, link para `/tarefa/:id`
- `TaskDetailView`: `GET /task/:id` + `claim/unclaim/complete` com `AnalisarSolicitacaoForm` (RH) ou `ConsultarRespostaForm` (Employee)
- `MinhasSolicitacoesView`: lista solicitações do usuário atual (filtro por `email` em variables)
- `ProcessosView`: `GET /process/definitions` + `diagram` -> `bpmn-js` NavigatedViewer
- `AnalisarFeriasView`: view RH (candidateGroups RH)
- Forms `AnalisarSolicitacaoForm` (rhDecision enum), `ValidarGestorForm` (viabilidade/impacto), `CancelarFeriasForm`, `ConsultarRespostaForm`

### dateHelpers - src/utils/dateHelpers.ts
- `daysBetween(startDate, endDate)`: calcula dias inclusivos entre ISO strings
- Usado em `SolicitarFeriasForm` para `days` e badge

## Workflows comuns

### 1. Rodar frontend férias
```bash
cd processos/socilitacao-ferias/frontend
npm install # instala bpms-frontend-master file: + axios/bpmn-js/react
npm run dev # http://localhost:3002 (strictPort true - falha se ocupado)
npm run build # vite build -> dist/
npm run type-check # tsc --noEmit
```

### 2. Adicionar nova rota
1. Criar componente em `src/components/views/NovaView.tsx` ou `forms/NovaForm.tsx`:
```typescript
export default function NovaView(){ return <div>Nova View</div> }
```
2. Adicionar em `src/routes.json`:
```json
{ "name": "Nova", "path": "/nova", "component": "NovaView", "icon": "★" }
```
3. Registrar em `src/App.tsx:40`:
```typescript
import NovaView from './components/views/NovaView'
const COMPONENT_MAP = { ..., NovaView }
```
4. Testar: `npm run dev` -> clicar no Sidebar "Nova"

### 3. Alterar form de solicitação
Editar `src/components/forms/SolicitarFeriasForm.tsx` - validações em `validateForm()`, payload em `handleSubmit:variables`, navegação pós-sucesso. Tipos em `src/types/index.ts:VacationFormData`.

### 4. Integrar com Motor (variáveis BPMN)
Enviar no `POST /process` (SolicitarFeriasForm.tsx:65):
```typescript
variables: {
  employeeName, email, startDate, endDate, reason, days, // usado por Motor/BPMN
  nome: employeeName, dataInicio: startDate, dataFim: endDate, motivo: reason // aliases PT
}
```
Motor usa `email` para `assignee="${email}"` em `EmployeeResponseTask`, `RHReviewTask` tem `rhDecision/rhResponse`.

### 5. Atualizar vendor master
```bash
# Se modulos/frontend mudou:
rm -rf processos/socilitacao-ferias/frontend/src/vendor/master
cp -r modulos/frontend/src processos/socilitacao-ferias/frontend/src/vendor/master
# Ou reinstalar file dependency
cd processos/socilitacao-ferias/frontend && npm install
```

### 6. Configurar URL do Motor
```bash
# .env
VITE_MOTOR_URL=http://localhost:81
# Ou build:
VITE_MOTOR_URL=http://motor:81 npm run build
# Fallback chain: VITE_MOTOR_URL -> VITE_API_URL -> http://localhost:81
```

## Dependências

- `bpms-frontend-master: file:../../modulos/frontend` (local)
- `react 19.2.8`, `react-dom 19.2.8`, `react-router-dom 7.18.2`, `axios 1.19.0`, `bpmn-js 18.25.1`
- Dev: `vite 8.2.0`, `@vitejs/plugin-react 6.0.4`, `typescript ~6.0.2`, `oxlint 1.75.0`

## Pitfalls & checagens

- **Vendor desatualizado**: `src/vendor/master/` é cópia estática - se `modulos/frontend` atualizar `Layout`/`UserContext`/`api`, copiar manualmente
- **Rota `_tarefa` aparece no menu**: `App.tsx` não filtra `path.startsWith('_')` - Sidebar mostra "_tarefa" como botão; filtrar com `buildMenuFromRoutes` ou `route.path.startsWith('_')?null:`
- **Alias vs file dependency**: `vite.config.ts` usa alias para vendor, mas `package.json` tem `file:../../modulos/frontend` - Vite resolve alias primeiro, pode confundir; manter ambos sync
- **Porta 3002 conflito**: master e férias ambos 3002 - master `strictPort false` tenta próxima porta, férias `strictPort true` falha; rodar um por vez ou mudar `vite.config.ts:port`
- **MotorApi sem ApiResponse**: diferente de `apiClient` master, `motorApi` retorna `T` direto e throw em erro - precisa try/catch nos views
- **daysBetween timezone**: `dateHelpers` pode calcular errado se ISO sem timezone; usar `new Date(startDate)` local
- **BPMN viewer**: `ProcessosView` precisa `bpmn-js NavigatedViewer` + CSS; diagram vem de `GET /process/definitions/:id/diagram` (XML)
- **CORS**: motor libera 3002/3003/5173 - se mudar porta frontend, atualizar `motor/src/main/resources/application.properties:3`
- **Variables duplicadas**: form envia tanto `employeeName` quanto `nome` - motor aceita ambos mas BPMN usa `email` como assignee; garantir `email` sempre enviado

## Verificação

```bash
cd processos/socilitacao-ferias/frontend
npm run type-check # sem erros TS
npm run build # vite build sucesso -> dist/
npm run dev # http://localhost:3002 -> verificar Sidebar (4 itens), criar solicitação, ver /atividades
curl http://localhost:81/task | jq # verificar integração Motor
# Testar bpmn:
curl http://localhost:81/process/definitions | jq
```
