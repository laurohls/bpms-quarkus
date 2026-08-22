# 🎯 Quick Reference: Master Frontend JSON-Driven

## O Padrão em 2 Minutos

### Master (`modulos/frontend/`)
Fornece:
- Componentes genéricos (Sidebar, PageHeader, AppFooter)
- Services (apiClient)
- Hooks (useApi, useMutation, etc)
- Types, Utils, CSS base

### Projeto (ex: Férias)
Contém:
- `routes.json` → Configuração de rotas
- `components/` → Lógica específica
- `App.tsx` → Lê routes.json, constrói menu
- `App.css` → Estende master (sem duplicar)

---

## routes.json

```json
{
  "basePath": "/processos/ferias",
  "routes": [
    {
      "name": "Dashboard",
      "path": "/dashboard",
      "component": "FeriasDashboard",
      "icon": "📊"
    },
    {
      "name": "Nova Solicitação",
      "path": "/solicitacao/nova",
      "component": "VacationForm",
      "icon": "📝"
    },
    {
      "name": "_detalhes",
      "path": "/solicitacoes/:id",
      "component": "VacationDetail",
      "icon": "_"
    }
  ]
}
```

**Notas:**
- Routes com `_` não aparecem no menu
- `component` é o nome do arquivo React

---

## App.tsx Template

```typescript
import { useEffect, useState } from 'react'
import {
  Sidebar, PageHeader, AppFooter, CurrentUserProvider,
  loadProjectRoutes, buildMenuFromRoutes,
  type ProjectRoutes,
} from 'bpms-frontend-master'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Componentes específicos
import FeriasDashboard from './components/FeriasDashboard'
import VacationForm from './components/VacationForm'
import VacationDetail from './components/VacationDetail'

const COMPONENT_MAP = {
  FeriasDashboard,
  VacationForm,
  VacationDetail,
}

export default function App() {
  const [routes, setRoutes] = useState<ProjectRoutes | null>(null)

  useEffect(() => {
    loadProjectRoutes('./src/routes.json').then(setRoutes)
  }, [])

  if (!routes) return <div>Carregando...</div>

  const menuItems = buildMenuFromRoutes(routes.routes, routes.basePath)

  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar>
            <span className="nav-label">Menu</span>
            {menuItems.map(item => (
              <a key={item.path} href={item.path} className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </Sidebar>
          <main className="main-content">
            <PageHeader title="Férias" subtitle="Sistema BPMS" />
            <Routes>
              {routes.routes.map(route => {
                const Component = COMPONENT_MAP[route.component]
                return <Route key={route.path} path={route.path} element={<Component />} />
              })}
            </Routes>
          </main>
          <AppFooter />
        </div>
      </BrowserRouter>
    </CurrentUserProvider>
  )
}
```

---

## Usando Hooks Master

```typescript
// GET
import { useApi } from 'bpms-frontend-master'
const { data, loading, error } = useApi('/api/tasks')

// POST/PUT/DELETE
import { useMutation } from 'bpms-frontend-master'
const { execute, loading } = useMutation('post')
await execute('/api/tasks', { name: '...' })

// User Context
import { useCurrentUser } from 'bpms-frontend-master'
const { user, switchUser } = useCurrentUser()

// localStorage
import { useLocalStorage } from 'bpms-frontend-master'
const [value, setValue] = useLocalStorage('key', 'default')

// Debounce
import { useDebounce } from 'bpms-frontend-master'
const debouncedValue = useDebounce(searchTerm, 500)
```

---

## Estrutura de Pasta Projeto

```
processos/novo-processo/frontend/src/
├── components/              # Apenas componentes específicos
│   ├── ComponenteA.tsx
│   └── ComponenteB.tsx
├── hooks/                   # Apenas hooks específicos (opcional)
│   └── useCustomData.ts
├── types/                   # Apenas types específicos (opcional)
│   └── custom.ts
├── routes.json             # ⭐ CONFIGURAÇÃO
├── App.tsx                 # ⭐ Lê routes.json
├── App.css                 # ⭐ Estende master
├── index.css
└── main.tsx

❌ NÃO duplicar:
- services/ (usar apiClient do master)
- contexts/ (usar CurrentUserProvider do master)
- hooks/useApi (importar do master)
```

---

## Comandos

### Desenvolver
```bash
cd modulos/frontend
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t bpms-nome .
docker run -p 3000:80 bpms-nome
```

---

## O que Master Exporta

```typescript
// Componentes
export { Sidebar, PageHeader, AppFooter }

// Context
export { CurrentUserProvider, useCurrentUser, BPMS_USERS }

// Services
export { apiClient }

// Hooks
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious }

// Utils
export { loadProjectRoutes, buildMenuFromRoutes, flattenMenu }

// Types
export type { User, RouteConfig, ProjectRoutes, ApiResponse, PaginatedResponse }
```

---

## Checklist: Novo Projeto

- [ ] Pasta criada
- [ ] `routes.json` criado
- [ ] `App.tsx` baseado no template
- [ ] Componentes em `components/`
- [ ] `App.css` com estilos específicos
- [ ] `package.json` referencia master
- [ ] `npm install` → OK
- [ ] `npm run dev` → OK
- [ ] Menu renderiza
- [ ] Navegação funciona
- [ ] Componentes renderizam

---

## Documentação Completa

1. **RESUMO_NOVA_ARQUITETURA.md** — Overview
2. **ARQUITETURA_NOVA_MASTER_PROJETO.md** — Detalhes técnicos + exemplos
3. **GUIA_REFATORACAO_NOVO_PADRAO.md** — Step-by-step completo
4. **DOCUMENTACAO_MASTER_FRONTEND.md** — Índice e troubleshooting
5. **STATUS_IMPLEMENTACAO_MASTER.md** — Status de implementação

---

## Quando Colocar no Master

✅ Componentes que servem para vários projetos  
✅ Hooks reutilizáveis  
✅ Services genéricos  
✅ Types compartilhadas  
✅ CSS base/variáveis  

## Quando Colocar no Projeto

❌ Componentes específicos do domínio  
❌ Hooks de negócio específico  
❌ Types de domínio  
❌ Estilos específicos  
❌ Lógica de validação do processo  

---

**Versão**: Quick Reference v1.0  
**Última atualização**: 2026-08-22
