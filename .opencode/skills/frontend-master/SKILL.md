---
name: frontend-master
description: Use when working on the Master Frontend Template at modulos/frontend - reusable layout, UserContext, hooks, apiClient, types, routeLoader, theme. Triggers on modulos/frontend, bpms-frontend-master, Sidebar, PageHeader, AppFooter, CurrentUserProvider, useCurrentUser, apiClient, routeLoader, master layout.
---

# Frontend Master Template Skill

Template base **React 19 + TypeScript 6 + Vite 8** que fornece biblioteca completa reutilizável para todos os frontends BPMS. Local: `modulos/frontend/` - package `bpms-frontend-master:1.0.0`. Porta dev **3002**.

## Quando usar

Use esta skill quando:
- Editar `modulos/frontend/src/components/Layout.tsx` (Sidebar, PageHeader, AppFooter)
- Alterar `CurrentUserProvider` / `useCurrentUser` / `BPMS_USERS` em `contexts/UserContext.tsx`
- Modificar `apiClient` (`services/api.ts`), hooks (`hooks/index.ts`), types (`types/index.ts`) ou `routeLoader` (`utils/routeLoader.ts`)
- Atualizar tema/CSS (`App.css`, `index.css`), Vite config, Dockerfile/nginx
- Criar novo projeto que herda do master - copiar padrão `routes.json` + `App.tsx`
- Vendorizar master para `processos/*/frontend/src/vendor/master/`

## Estrutura de referência

```
modulos/frontend/
├── package.json          # name bpms-frontend-master 1.0.0, exports . -> src/App.tsx
├── vite.config.ts        # port 3002 strictPort false, plugin react
├── tsconfig.json / tsconfig.app.json
├── Dockerfile + nginx.conf + .dockerignore
├── index.html + public/
└── src/
    ├── App.tsx           # modulos/frontend/src/App.tsx:1 - re-exports TUDO + DemoApp (128 linhas)
    ├── App.css + index.css # tema DETRAN-MS navy #0A192F blue #004F9F vars --bpms-*
    ├── main.tsx          # ReactDOM createRoot + DemoApp
    ├── index.ts          # barrel alternativo
    ├── components/
    │   └── Layout.tsx    # modulos/frontend/src/components/Layout.tsx:1 - Sidebar, PageHeader, AppFooter
    ├── contexts/
    │   └── UserContext.tsx # modulos/frontend/src/contexts/UserContext.tsx:1 - CurrentUserProvider, BPMS_USERS
    ├── services/
    │   └── api.ts        # modulos/frontend/src/services/api.ts:1 - ApiClient axios baseURL VITE_API_URL || 8080/api
    ├── hooks/
    │   └── index.ts      # modulos/frontend/src/hooks/index.ts:1 - useApi, useMutation, useLocalStorage, useDebounce, usePrevious
    ├── types/
    │   └── index.ts      # modulos/frontend/src/types/index.ts:1 - User, RouteConfig, ProjectRoutes, ApiResponse
    └── utils/
        └── routeLoader.ts # modulos/frontend/src/utils/routeLoader.ts:1 - loadProjectRoutes, buildMenuFromRoutes, flattenMenu
```

## O que o Master exporta (App.tsx)

```typescript
// Layout - modulos/frontend/src/components/Layout.tsx:7
export { Sidebar, PageHeader, AppFooter }
export type { SidebarProps, PageHeaderProps, AppFooterProps }

// User Context - modulos/frontend/src/contexts/UserContext.tsx:9
export { CurrentUserProvider, useCurrentUser }
export type { CurrentUserCtx }
export { BPMS_USERS } // admin, gestor, user

// Types - modulos/frontend/src/types/index.ts:10
export type { User, RouteConfig, ProjectRoutes, ApiResponse, PaginatedResponse }

// Services - modulos/frontend/src/services/api.ts:93
export { apiClient } // get<T>, post<T>, put<T>, delete<T>, getPaginated<T>

// Hooks - modulos/frontend/src/hooks/index.ts:15
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious }

// Utils - modulos/frontend/src/utils/routeLoader.ts:13
export { loadProjectRoutes, buildMenuFromRoutes, flattenMenu }
export type { MenuItem }
```

## Detalhamento por módulo

### Layout.tsx - modulos/frontend/src/components/Layout.tsx:1
- `Sidebar({ children })`: brand `◈ BPMS Master Layout` + `nav.sidebar-nav` (children) + `sidebar-bottom` (user-card com avatar/initials + select trocar usuário via `ctx.switchUser`)
- `PageHeader({ title, subtitle, rightContent })`: `div.kicker` subtitle + `h1` title + `header-meta` com `online-dot` (verde)fallback "Conectado"
- `AppFooter({ children })`: `app-footer-inner` com `BPMS Business Process Management System` + `Sistema administrativo`

### UserContext.tsx - modulos/frontend/src/contexts/UserContext.tsx:1
- `BPMS_USERS`: `admin (Administrador)`, `gestor (Carlos Mendes/Gestor)`, `user (Usuário Padrão/Servidor)` - `modulos/frontend/src/contexts/UserContext.tsx:17`
- `CurrentUserProvider({ children, users=BPMS_USERS })`: persiste `bpms.currentUserId` em localStorage, `useState(getInitial)`, `switchUser` com `useCallback`
- `useCurrentUser()`: throw se fora de Provider

### api.ts - modulos/frontend/src/services/api.ts:1
- `API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'` - **atenção**: default 8080/api (não 81)
- `class ApiClient` com `axios.create({ baseURL, headers: JSON })` + interceptor `Authorization: Bearer ${localStorage.bpms.authToken}`
- Métodos: `get<T>(path)`, `post<T>`, `put<T>`, `delete<T>`, `getPaginated<T>(path, page, pageSize)` - todos retornam `ApiResponse<T>` com try/catch (`success:false, error:message`)
- Export singleton `apiClient = new ApiClient()`

### hooks/index.ts - modulos/frontend/src/hooks/index.ts:1
- `useApi<T>(url, immediate=true)`: state `data/loading/error` + `fetchData` via `apiClient.get<T>(url)` + `useEffect([url, immediate])` + `refetch`
- `useMutation<TData,TPayload>(method: post|put|delete)`: state `data/loading/error` + `execute(url,payload)` switch method
- `useLocalStorage<T>(key, initialValue)`: JSON parse/stringify + `Function` check
- `useDebounce<T>(value, delay=500)`: setTimeout + cleanup
- `usePrevious<T>(value)`: useEffect setPrevious

### types/index.ts - modulos/frontend/src/types/index.ts:1
```typescript
type User = { id, name, role, initials }
type RouteConfig = { name, path, component, icon?, children?: RouteConfig[] }
type ProjectRoutes = { basePath, routes: RouteConfig[] }
type ApiResponse<T> = { success:boolean, data?:T, error?:string, message?:string }
type PaginatedResponse<T> = ApiResponse<{ items:T[], total, page, pageSize }>
```

### routeLoader.ts - modulos/frontend/src/utils/routeLoader.ts:1
- `loadProjectRoutes(routesPath)`: `fetch(routesPath)` -> `response.json()` fallback `{basePath:'/', routes:[]}`
- `buildMenuFromRoutes(routes, basePath='')`: filter `!path.startsWith('_')` (rotas internas), map para `MenuItem {name, path: basePath+path, icon:'•', children?}`
- `flattenMenu(menu)`: reduce recursivo
- `MenuItem = { name, path, icon?, children? }`

### Tema CSS (index.css + App.css)
```css
--bpms-blue: #004f9f; --bpms-blue-bright: #0073d9; --bpms-navy: #0A192F
--bpms-white: #ffffff; --bpms-content: #f4f7f6; --bpms-line: #d9e1d9
--font-heading: Nunito Sans; --font-body: Open Sans
```
Classes: `app-shell` (flex), `sidebar`, `sidebar-top/brand`, `sidebar-nav/nav-item/nav-icon/nav-label`, `sidebar-bottom/user-card`, `main-content`, `page-header`, `app-footer`

## Configuração

### package.json
```json
{
  "name": "bpms-frontend-master", "version": "1.0.0", "type": "module",
  "exports": { ".": "./src/App.tsx" },
  "scripts": { "dev":"vite", "build":"tsc -b && vite build", "lint":"oxlint", "preview":"vite preview" },
  "dependencies": { "axios":"^1.19.0", "bpmn-js":"^18.25.1", "react":"^19.2.8", "react-dom":"^19.2.8", "react-router-dom":"^7.18.2" }
}
```

### vite.config.ts
```typescript
export default defineConfig({ plugins:[react()], server:{ host:'localhost', port:3002, strictPort:false } })
```

## Workflows comuns

### 1. Rodar master demo
```bash
cd modulos/frontend
npm install
npm run dev # http://localhost:3002 - DemoApp com Sidebar + PageHeader + lista componentes
npm run build # tsc -b && vite build -> dist/
npm run lint # oxlint
```

### 2. Alterar tema / Layout
Editar `src/index.css` vars `--bpms-*` ou `src/components/Layout.tsx` - todos projetos herdam via `App.css`/`index.css`. Testar em `src/App.tsx` DemoApp antes de propagar para `processos/*/frontend/src/vendor/master/`.

### 3. Adicionar novo hook/util/type
1. Criar em `src/hooks/index.ts` ou `src/utils/` ou `src/types/index.ts`
2. Re-exportar em `src/App.tsx` (ex: `export { useMeuHook } from './hooks'`)
3. Atualizar `src/vendor/master/` nos projetos filhos: `cp -r modulos/frontend/src/* processos/socilitacao-ferias/frontend/src/vendor/master/`
4. Ou `npm install` se usar `file:../../modulos/frontend` (férias frontend usa este link)

### 4. Criar novo projeto que herda master (padrão oficial)
```bash
# 1. Estrutura mínima
mkdir -p meu-processo/frontend/src/{components/{forms,views},services,types}
# 2. package.json com "bpms-frontend-master": "file:../../modulos/frontend"
# 3. vite.config.ts com alias 'bpms-frontend-master' -> './src/vendor/master'
# 4. src/routes.json
{
  "basePath": "/meu-processo",
  "routes": [
    { "name": "Dashboard", "path": "/dashboard", "component": "MeuDashboard", "icon": "◈" },
    { "name": "_detalhe", "path": "/detalhe/:id", "component": "DetalheView", "icon": "_" }
  ]
}
# 5. src/App.tsx com COMPONENT_MAP + loadProjectRoutes('/routes.json') + Routes dinâmicas
# Ver template completo em processos/socilitacao-ferias/frontend/src/App.tsx:40
```

### 5. Vendorizar master (quando usar cópia local)
```bash
# Férias frontend usa vendor por estabilidade
cp -r modulos/frontend/src/components processos/socilitacao-ferias/frontend/src/vendor/master/
cp -r modulos/frontend/src/contexts processos/socilitacao-ferias/frontend/src/vendor/master/
cp modulos/frontend/src/App.css processos/socilitacao-ferias/frontend/src/vendor/master/
# vite.config.ts alias garante import 'bpms-frontend-master' resolve para vendor
```

## Dependências

- `react 19.2.8`, `react-dom 19.2.8`, `react-router-dom 7.18.2`, `axios 1.19.0`, `bpmn-js 18.25.1`
- Dev: `vite 8.2.0`, `@vitejs/plugin-react 6.0.4`, `typescript ~6.0.2`, `oxlint 1.75.0`, `@types/react 19.2.17`

## Pitfalls & checagens

- `apiClient` baseURL default `8080/api` diverge de motor `81` - projetos filhos devem configurar `VITE_API_URL` ou usar `motorApi` custom (férias faz `VITE_MOTOR_URL || VITE_API_URL || localhost:81`)
- `package.json` exports `".": "./src/App.tsx"` é para `file:` dependency, mas férias frontend prefere vendor + alias para evitar symlink issues no Vite
- `Sidebar` children é `ReactNode` livre - projeto controla `nav-item` + `onClick navigate` manualmente (não gera menu automático; usar `buildMenuFromRoutes` se quiser)
- `BPMS_USERS` hardcoded - trocar via prop `users` no `CurrentUserProvider` para roles reais (ex: RH, Servidor)
- CSS vars em `index.css:root` - se sobrescrever, manter `--bpms-navy/blue/content/line/text/muted` para compatibilidade
- `DemoApp` em `App.tsx:53` é só para teste master - não usar em produção; produção importa só os named exports
- Ambos master e férias na porta 3002 (`strictPort false` vs `true`) - rodar um por vez ou mudar porta em `vite.config.ts`

## Verificação

```bash
cd modulos/frontend && npm run build # deve gerar dist/ sem erros tsc
npm run lint # oxlint
# Testar imports:
node -e "import('bpms-frontend-master')" # se linkado
# Visual: npm run dev -> http://localhost:3002 ver Sidebar/PageHeader
```
