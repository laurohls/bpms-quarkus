# BPMS Frontend Master Template

Frontend React + TypeScript + Vite para BPMS (Business Process Management System).

Este é o **projeto master** que fornece **tudo** que os outros frontends precisam:
- Componentes de layout (Sidebar, PageHeader, AppFooter)
- User context e hooks reutilizáveis
- Services genéricos (API client)
- Types centralizados
- Utilities para roteamento dinâmico
- Tema consistente e CSS base

## 🎯 Propósito

Master = Sistema Completo (não apenas layout!)

- **Componentes Genéricos**: Sidebar, PageHeader, AppFooter (reutilizáveis)
- **Services**: apiClient com get, post, put, delete, getPaginated
- **Hooks**: useApi, useMutation, useLocalStorage, useDebounce, usePrevious
- **User Context**: CurrentUserProvider + useCurrentUser hook
- **Types Centralizados**: User, RouteConfig, ApiResponse, etc
- **Utils**: loadProjectRoutes, buildMenuFromRoutes, flattenMenu
- **Tema Consistente**: CSS com variáveis herdáveis
- **Roteamento Dinâmico**: Sistema JSON-driven para projetos

## 🚀 Quick Start

### Desenvolvimento Local

```bash
npm install
npm run dev
```

O frontend será servido em `http://localhost:3002`

### Build para Produção

```bash
npm run build
```

Gera artefatos otimizados em `dist/`

### Linting

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
modulos/frontend/src/
├── components/
│   └── Layout.tsx              # Sidebar, PageHeader, AppFooter (genéricos)
├── contexts/
│   └── UserContext.tsx         # CurrentUserProvider + useCurrentUser
├── hooks/
│   └── index.ts                # useApi, useMutation, useLocalStorage, etc
├── services/
│   └── api.ts                  # apiClient genérico
├── types/
│   └── index.ts                # Types centralizados (User, RouteConfig, etc)
├── utils/
│   └── routeLoader.ts          # loadProjectRoutes, buildMenuFromRoutes
├── App.tsx                     # Re-exporta TUDO + DemoApp
├── App.css                     # Estilos base com variáveis CSS
├── index.css                   # Reset + variáveis globais
└── main.tsx                    # Entry point React

Raiz:
├── Dockerfile                  # Multi-stage build
├── nginx.conf                  # SPA routing
├── vite.config.ts
├── package.json
├── tsconfig.json
└── .dockerignore
```

## 🎨 O que Master Exporta

### Componentes
```typescript
export { Sidebar, PageHeader, AppFooter }
```
Componentes prontos para usar em qualquer projeto.

### Context & Hooks
```typescript
export { CurrentUserProvider, useCurrentUser }
export { BPMS_USERS }
```
Gerenciamento de usuário reutilizável.

### Services
```typescript
export { apiClient }
// Métodos: get<T>, post<T>, put<T>, delete<T>, getPaginated<T>
```
Cliente HTTP pré-configurado, pronto para usar.

### Hooks Genéricos
```typescript
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious }
```
Hooks reutilizáveis para: GET requests, POST/PUT/DELETE, localStorage, debounce.

### Types Centralizados
```typescript
export type { User, RouteConfig, ProjectRoutes, ApiResponse, PaginatedResponse }
```

### Utils de Roteamento
```typescript
export { loadProjectRoutes, buildMenuFromRoutes, flattenMenu }
```
Para carregar `routes.json` e construir menu dinamicamente.

### CSS & Tema
```
Variáveis CSS disponíveis para herança:
--bpms-blue, --bpms-navy, --bpms-white, --bpms-light-gray, --bpms-border, etc
```

## 🔄 Como Usar em Outros Projetos (Novo Padrão)

Cada projeto que herda master contém **APENAS**:
1. `routes.json` — Configuração de rotas em JSON
2. Componentes específicos — Lógica do negócio
3. `App.tsx` — Lê routes.json, constrói menu, renderiza componentes

**Não precisa duplicar nada mais!** Services, hooks, types e CSS vêm do master.

### Exemplo: Projeto de Férias

**1. Criar routes.json**
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
    }
  ]
}
```

**2. Criar App.tsx**
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

// Importar componentes específicos
import FeriasDashboard from './components/FeriasDashboard'
import VacationForm from './components/VacationForm'

export default function App() {
  const [routes, setRoutes] = useState(null)

  useEffect(() => {
    loadProjectRoutes('./src/routes.json').then(setRoutes)
  }, [])

  if (!routes) return <div>Carregando...</div>

  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar>
            {buildMenuFromRoutes(routes.routes, routes.basePath).map((item) => (
              <a key={item.path} href={item.path} className="nav-item">
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </Sidebar>
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<FeriasDashboard />} />
              <Route path="/solicitacao/nova" element={<VacationForm />} />
            </Routes>
          </main>
          <AppFooter />
        </div>
      </BrowserRouter>
    </CurrentUserProvider>
  )
}
```

**3. Usar Hooks do Master**
```typescript
import { useCurrentUser, useApi, useMutation } from 'bpms-frontend-master'

function VacationForm() {
  const { user } = useCurrentUser()
  const { execute: submit, loading } = useMutation('post')

  const handleSubmit = async () => {
    await submit('/api/vacation', { userId: user.id, startDate: '...' })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**Veja também**: 
- [`ARQUITETURA_NOVA_MASTER_PROJETO.md`](../../ARQUITETURA_NOVA_MASTER_PROJETO.md) — Entender a arquitetura
- [`GUIA_REFATORACAO_NOVO_PADRAO.md`](../../GUIA_REFATORACAO_NOVO_PADRAO.md) — Step-by-step de implementação

## 🔗 Integração com Motor

O frontend se conecta ao motor BPMS via API REST:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:81'
})
```

Configure `VITE_API_URL` durante build conforme necessário.

## 🐳 Docker

### Build da Imagem

```bash
docker build -t bpms-frontend-master .
```

### Rodar Localmente

```bash
docker run -p 3002:80 bpms-frontend-master
```

Acesse em `http://localhost:3002`

### Em docker-compose.yml

```yaml
frontend:
  build: ./modulos/frontend
  ports:
    - "3002:80"
  environment:
    - VITE_API_URL=http://motor:8080
```

## 🔐 Usuários de Teste

Sistema inclui 3 usuários pré-configurados:
- **admin** - Administrador do Sistema
- **gestor** - Gestor (Manager)
- **user** - Usuário Padrão

Alternar usuário via dropdown no sidebar inferior.

## 📦 Dependências

- **React 19.2.8** - UI framework
- **React Router 7.18.2** - Roteamento
- **Axios 1.19.0** - HTTP client
- **BPMN.js 18.25.1** - Visualização BPMN
- **Vite 8.2.0** - Build tool
- **TypeScript 6.0.2** - Type safety
- **Oxlint 1.75.0** - Linter

## 🔧 Scripts

| Command | Propósito |
|---------|-----------|
| `npm run dev` | Inicia servidor dev com HMR |
| `npm run build` | Build otimizado para produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Roda Oxlint |

## 📚 Referências

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [React Router Documentation](https://reactrouter.com)
- [BPMN.js Documentation](https://github.com/bpmn-io/bpmn-js)

## 📝 Notas

- Este é um projeto template master
- Cada módulo BPMS herda estrutura e estilos daqui
- Mantém-se independente de lógica de negócio específica
- Facilita padronização visual e de UX em toda plataforma

---

**Criado como parte do BPMS Quarkus com CIB seven e PostgreSQL**
