# 📐 Arquitetura Master-to-Project (Novo Padrão)

## Visão Geral

A nova arquitetura implementa um padrão **extremamente limpo e escalável**:

- **Master** (`modulos/frontend/`): Sistema completo de roteamento + bibliotecas + serviços + layout
- **Projeto** (`processos/*/frontend/`): **APENAS** `routes.json` + componentes específicos

## Estrutura Master

```
modulos/frontend/src/
├── components/
│   └── Layout.tsx                 # Sidebar, PageHeader, AppFooter (genéricos)
├── contexts/
│   └── UserContext.tsx           # CurrentUserProvider + useCurrentUser hook
├── hooks/
│   └── index.ts                  # useApi, useMutation, useLocalStorage, useDebounce, usePrevious
├── services/
│   └── api.ts                    # Client HTTP genérico (get, post, put, delete, getPaginated)
├── types/
│   └── index.ts                  # User, RouteConfig, ProjectRoutes, ApiResponse
├── utils/
│   └── routeLoader.ts            # loadProjectRoutes, buildMenuFromRoutes, flattenMenu
├── App.tsx                       # Re-exporta TUDO + DemoApp
├── App.css                       # Estilos base (variáveis CSS, layout)
├── index.css                     # Reset + variáveis globais
└── main.tsx                      # Entry point React
```

### O que Master Fornece

```typescript
// Componentes de Layout
export { Sidebar, PageHeader, AppFooter }

// Context + Hooks
export { CurrentUserProvider, useCurrentUser }
export { BPMS_USERS }

// Services
export { apiClient }  // Métodos: get, post, put, delete, getPaginated

// Hooks Genéricos
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious }

// Utils de Roteamento
export { loadProjectRoutes, buildMenuFromRoutes, flattenMenu }

// Types
export type { User, RouteConfig, ProjectRoutes, ApiResponse, PaginatedResponse }
```

## Estrutura Projeto (ex: Férias)

```
processos/socilitacao-ferias/frontend/
├── src/
│   ├── components/
│   │   ├── VacationForm.tsx          # Formulário específico
│   │   ├── TaskCard.tsx              # Componente específico
│   │   └── TaskBoard.tsx             # Componente específico
│   ├── hooks/
│   │   └── useVacationData.ts        # Hook específico do processo
│   ├── types/
│   │   └── vacation.ts              # Types específicos de férias
│   ├── routes.json                   # ⭐ APENAS CONFIGURAÇÃO
│   ├── App.tsx                       # Importa do master, implementa roteamento
│   ├── App.css                       # Estende master CSS (sem duplicar)
│   └── main.tsx                      # Entry point
├── package.json                      # Herda dependencies do master
└── Dockerfile
```

## O Arquivo routes.json

**Exemplo: `processos/socilitacao-ferias/frontend/src/routes.json`**

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
      "name": "Solicitações",
      "path": "/solicitacoes",
      "component": "VacationForm",
      "icon": "📝"
    },
    {
      "name": "Tarefas",
      "path": "/tarefas",
      "component": "TaskBoard",
      "icon": "✓"
    },
    {
      "name": "_pendentes",
      "path": "/pendentes",
      "component": "PendingList",
      "icon": "_"
    }
  ]
}
```

**Rotas com `_` são "internas"** (não aparecem no menu, mas são acessíveis via URL).

## Como o Projeto Usa Master

### 1️⃣ Carregar Routes

```typescript
// App.tsx do projeto Férias
import { loadProjectRoutes, buildMenuFromRoutes } from 'bpms-frontend-master'
import { useEffect, useState } from 'react'

export default function App() {
  const [routes, setRoutes] = useState(null)
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    loadProjectRoutes('./src/routes.json').then((config) => {
      setRoutes(config)
      setMenuItems(buildMenuFromRoutes(config.routes, config.basePath))
    })
  }, [])

  if (!routes) return <div>Carregando...</div>
  return <AppLayout routes={routes} menuItems={menuItems} />
}
```

### 2️⃣ Renderizar Dinâmico

```typescript
import { Sidebar, PageHeader, AppFooter, CurrentUserProvider } from 'bpms-frontend-master'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function AppLayout({ routes, menuItems }) {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar>
            <span className="nav-label">Menu</span>
            {menuItems.map((item) => (
              <a key={item.path} href={item.path} className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </Sidebar>
          <main className="main-content">
            <Routes>
              {routes.routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={dynamicImportComponent(route.component)}
                />
              ))}
            </Routes>
          </main>
          <AppFooter />
        </div>
      </BrowserRouter>
    </CurrentUserProvider>
  )
}
```

### 3️⃣ Usar Hooks Genéricos

```typescript
// Em qualquer componente do projeto
import { useApi, useMutation, useCurrentUser } from 'bpms-frontend-master'

function TaskBoard() {
  const { user } = useCurrentUser()
  const { data: tasks, loading } = useApi(`/api/tasks?userId=${user.id}`)
  const { execute: updateTask, loading: updating } = useMutation('put')

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} onUpdate={updateTask} />
      ))}
    </div>
  )
}
```

### 4️⃣ Estender CSS sem Duplicar

```css
/* App.css do projeto Férias */
/* Importa as variáveis master e estilos base automaticamente */

/* Apenas adicione estilos específicos do projeto */
.vacation-form {
  padding: 20px;
  background: var(--bpms-light-gray);
  border-radius: 8px;
}

.task-card {
  border-left: 4px solid var(--bpms-blue);
  padding: 16px;
}
```

## Comparativo: Antes vs Depois

### ❌ Antes (Guia Anterior)

```
Master continha:
- Componentes layout ✓
- User context ✓
- CSS base ✓
- MAS também tinha tipos genéricos espalhados
- E hooks específicos de processos
- E serviços não reutilizáveis

Projeto Férias deveria:
- Ter components/, hooks/, types/ próprios
- Importar layout do master
- Duplicar package.json completo
- Ter seu próprio axios setup
```

### ✅ Depois (Novo Padrão)

```
Master contém:
- Componentes layout (genéricos)
- User context (reutilizável)
- Hooks genéricos (useApi, useMutation, useLocalStorage, etc)
- Services (apiClient pronto para usar)
- Types (centralizados)
- Utils (loadProjectRoutes, buildMenuFromRoutes)
- CSS base com variáveis
- Todas as bibliotecas (React, React Router, axios)

Projeto Férias contém APENAS:
- routes.json (configuração de rotas)
- Components específicos (VacationForm, TaskBoard, etc)
- Hooks específicos (useVacationData, etc)
- Types específicos (VacationRequest, etc)
- App.tsx (que constrói menu de routes.json)
- App.css (que estende master CSS)
```

## Exemplo Completo: Proyecto Férias

### 1. routes.json

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
      "path": "/solicitacoes/nova",
      "component": "VacationForm",
      "icon": "📝"
    },
    {
      "name": "Minhas Solicitações",
      "path": "/minhas-solicitacoes",
      "component": "MyVacations",
      "icon": "📋"
    }
  ]
}
```

### 2. App.tsx

```typescript
import { useEffect, useState } from 'react'
import {
  Sidebar,
  PageHeader,
  AppFooter,
  CurrentUserProvider,
  loadProjectRoutes,
  buildMenuFromRoutes,
} from 'bpms-frontend-master'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

// Lazy load dos componentes específicos
import FeriasDashboard from './components/FeriasDashboard'
import VacationForm from './components/VacationForm'
import MyVacations from './components/MyVacations'

const COMPONENT_MAP = {
  FeriasDashboard,
  VacationForm,
  MyVacations,
}

export default function App() {
  const [routes, setRoutes] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectRoutes('./src/routes.json').then((config) => {
      setRoutes(config)
      setMenuItems(buildMenuFromRoutes(config.routes, config.basePath))
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar>
            <span className="nav-label">Menu</span>
            {menuItems.map((item) => (
              <a key={item.path} href={item.path} className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </Sidebar>
          <main className="main-content">
            <PageHeader title="Solicitar Férias" subtitle="Processo Administrativo" />
            <Routes>
              {routes.routes.map((route) => {
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

### 3. VacationForm.tsx (Específico de Férias)

```typescript
import { useCurrentUser, useMutation, PageHeader } from 'bpms-frontend-master'
import { useState } from 'react'

type VacationRequest = {
  startDate: string
  endDate: string
  reason?: string
}

export default function VacationForm() {
  const { user } = useCurrentUser()
  const { execute: submitRequest, loading } = useMutation('post')
  const [formData, setFormData] = useState<VacationRequest>({
    startDate: '',
    endDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await submitRequest('/api/vacation-requests', {
      ...formData,
      userId: user.id,
    })
    if (response.success) {
      alert('Solicitação enviada com sucesso!')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="vacation-form">
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
      />
      <input
        type="date"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        required
      />
      <textarea
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        placeholder="Motivo (opcional)"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Solicitar Férias'}
      </button>
    </form>
  )
}
```

### 4. App.css (Estende Master)

```css
/* Apenas estilos ESPECÍFICOS de férias */

.vacation-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid var(--bpms-border);
  border-radius: 8px;
  background: var(--bpms-white);
}

.vacation-form input,
.vacation-form textarea {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid var(--bpms-border);
  border-radius: 4px;
  font: inherit;
}

.vacation-form button {
  background: var(--bpms-blue);
  color: var(--bpms-white);
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.vacation-form button:hover {
  background: var(--bpms-navy);
}

.vacation-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Vantagens da Nova Arquitetura

✅ **Zero Duplicação**: Master tem tudo genérico, projetos apenas configuram  
✅ **JSON-Driven**: Rotas definidas em JSON, menu gerado automaticamente  
✅ **Fácil Adicionar Novos Processos**: Copie `routes.json` + alguns componentes  
✅ **Reutilização de Código**: Todos os hooks/services genéricos no master  
✅ **CSS Compartilhado**: Variáveis e layout base herdado, sem duplicação  
✅ **Type-Safe**: Types centralizados em master, reutilizáveis  
✅ **Escalável**: Suporta N processos sem crescimento exponencial de código  

## Próximas Etapas

1. ✅ Master refatorado com nova estrutura
2. 🔜 Refatorar projeto Férias para usar novo padrão
3. 🔜 Testar roteamento dinâmico
4. 🔜 Validar bundle size e performance
