# 🎯 Guia de Refatoração: Proyecto Férias para Novo Padrão Master

## Visão Geral

Este guia transforma o projeto Férias de **código genérico + específico misturado** para **APENAS configuração + componentes específicos**.

## Pré-requisitos

- Master refatorado em `modulos/frontend/` ✅
- Node.js 18+
- Projeto Férias em `processos/socilitacao-ferias/frontend/`

## Etapa 1: Criar routes.json

**Arquivo**: `processos/socilitacao-ferias/frontend/src/routes.json`

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
      "name": "Minhas Solicitações",
      "path": "/solicitacoes/minhas",
      "component": "MyVacations",
      "icon": "📋"
    },
    {
      "name": "Aprovar Solicitações",
      "path": "/solicitacoes/aprovar",
      "component": "ApproveVacations",
      "icon": "✓",
      "children": []
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

### Notas:
- Routes com `_` não aparecem no menu (internas)
- `component` é o nome do arquivo React sem extensão
- `icon` é renderizado como texto/emoji no menu

## Etapa 2: Organizar Componentes Específicos

**Criar pasta** `processos/socilitacao-ferias/frontend/src/components/`

Mover/criar apenas componentes **específicos** do processo, organizados por tipo:

```
components/
├── forms/                                    # 🔵 Formulários individuais
│   ├── SolicitarFeriasForm.tsx              # Servidor solicita
│   ├── AnalisarSolicitacaoForm.tsx          # RH analisa/aprova
│   ├── ValidarGestorForm.tsx                # Gestor valida
│   └── CancelarFeriasForm.tsx               # Cancelar férias
│
├── views/                                    # 🟢 Páginas/Views
│   ├── SolicitarFeriasView.tsx              # Page: Solicitar
│   ├── AnalisarSolicitacoesView.tsx         # Page: Analisar
│   ├── MinhasSolicitacoesView.tsx           # Page: Minhas solicitações
│   └── DashboardFeriasView.tsx              # Page: Dashboard
│
└── shared/                                   # 🟡 Componentes reutilizáveis
    ├── VacationCard.tsx                    # Card de exibição
    ├── SolicitacoesList.tsx                # Lista de solicitações
    └── StatusBadge.tsx                     # Badge de status
```

**Estrutura de Pastas Completa:**

```
processos/socilitacao-ferias/frontend/src/
├── components/
│   ├── forms/
│   │   ├── SolicitarFeriasForm.tsx
│   │   ├── AnalisarSolicitacaoForm.tsx
│   │   ├── ValidarGestorForm.tsx
│   │   └── CancelarFeriasForm.tsx
│   ├── views/
│   │   ├── SolicitarFeriasView.tsx
│   │   ├── AnalisarSolicitacoesView.tsx
│   │   ├── MinhasSolicitacoesView.tsx
│   │   └── DashboardFeriasView.tsx
│   ├── shared/
│   │   ├── VacationCard.tsx
│   │   ├── SolicitacoesList.tsx
│   │   └── StatusBadge.tsx
│   └── styles/
│       ├── solicitar-ferias.css
│       ├── analisar-solicitacoes.css
│       └── minhas-solicitacoes.css
├── hooks/
│   └── useFeriaData.ts                  (apenas se específico)
├── types/
│   └── ferias.ts                        (apenas se específico)
├── routes.json
├── App.tsx
└── App.css
```

**NÃO mover**: `Sidebar`, `PageHeader`, `AppFooter` (já estão no master!)

**Importante**: Cada **formulário é um arquivo separado**, não um componente genérico!

## Etapa 3: Criar App.tsx Novo

**Arquivo**: `processos/socilitacao-ferias/frontend/src/App.tsx`

```typescript
import { useEffect, useState } from 'react'
import {
  Sidebar,
  PageHeader,
  AppFooter,
  CurrentUserProvider,
  loadProjectRoutes,
  buildMenuFromRoutes,
  type ProjectRoutes,
} from 'bpms-frontend-master'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import './App.css'

// Import de componentes específicos
import FeriasDashboard from './components/FeriasDashboard'
import VacationForm from './components/VacationForm'
import MyVacations from './components/MyVacations'
import ApproveVacations from './components/ApproveVacations'
import VacationDetail from './components/VacationDetail'

// Mapa de componentes (para roteamento dinâmico)
const COMPONENT_MAP: Record<string, React.ComponentType> = {
  FeriasDashboard,
  VacationForm,
  MyVacations,
  ApproveVacations,
  VacationDetail,
}

function AppLayout({ routes }: { routes: ProjectRoutes }) {
  const menuItems = buildMenuFromRoutes(routes.routes, routes.basePath)

  return (
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
        <PageHeader title="Solicitar Férias" subtitle="Sistema BPMS" />
        <div className="page-content">
          <Routes>
            {routes.routes.map((route) => {
              const Component = COMPONENT_MAP[route.component as keyof typeof COMPONENT_MAP]
              if (!Component) {
                console.warn(`Componente ${route.component} não encontrado`)
                return null
              }
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<Component />}
                />
              )
            })}
          </Routes>
        </div>
      </main>
      <AppFooter />
    </div>
  )
}

export default function App() {
  const [routes, setRoutes] = useState<ProjectRoutes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjectRoutes('./src/routes.json')
      .then((config) => {
        if (!config || !config.routes) {
          throw new Error('Routes config is empty')
        }
        setRoutes(config)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar rotas')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Carregando aplicação...</p>
      </div>
    )
  }

  if (error || !routes) {
    return (
      <div className="error-container">
        <h1>❌ Erro ao inicializar</h1>
        <p>{error || 'Routes não carregadas'}</p>
      </div>
    )
  }

  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <AppLayout routes={routes} />
      </BrowserRouter>
    </CurrentUserProvider>
  )
}
```

## Etapa 4: Atualizar App.css

**Arquivo**: `processos/socilitacao-ferias/frontend/src/App.css`

```css
/* NÃO COPIE nada do master aqui! Apenas estilos específicos */

/* Layout interno da página */
.page-content {
  padding: 20px;
  background: var(--bpms-light-gray);
  min-height: calc(100vh - 240px); /* Altura sem header/footer */
}

/* Componentes específicos de férias */
.vacation-form {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bpms-white);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vacation-form-group {
  margin-bottom: 20px;
}

.vacation-form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--bpms-navy);
}

.vacation-form-group input,
.vacation-form-group textarea,
.vacation-form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--bpms-border);
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.vacation-form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--bpms-blue);
  color: var(--bpms-white);
}

.btn-primary:hover {
  background: var(--bpms-navy);
}

.btn-secondary {
  background: var(--bpms-light-gray);
  color: var(--bpms-navy);
  border: 1px solid var(--bpms-border);
}

.btn-secondary:hover {
  background: #f0f0f0;
}

/* Card de solicitação */
.vacation-card {
  background: var(--bpms-white);
  border-left: 4px solid var(--bpms-blue);
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.vacation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vacation-card-header h3 {
  margin: 0;
  color: var(--bpms-navy);
}

.vacation-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.vacation-status.pending {
  background: #fff3cd;
  color: #856404;
}

.vacation-status.approved {
  background: #d4edda;
  color: #155724;
}

.vacation-status.rejected {
  background: #f8d7da;
  color: #721c24;
}

/* Loading e error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bpms-light-gray);
}

.spinner {
  border: 4px solid var(--bpms-border);
  border-top: 4px solid var(--bpms-blue);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container h1 {
  color: #721c24;
}
```

## Etapa 5: Atualizar package.json

**Arquivo**: `processos/socilitacao-ferias/frontend/package.json`

```json
{
  "name": "bpms-socilitacao-ferias",
  "private": true,
  "version": "1.0.0",
  "description": "Frontend para processo de solicitação de férias",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "bpms-frontend-master": "file:../../modulos/frontend",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}
```

## Etapa 6: Verificar Estrutura

Após refatorar, a estrutura deve ser:

```
processos/socilitacao-ferias/frontend/src/
├── components/
│   ├── ApproveVacations.tsx
│   ├── FeriasDashboard.tsx
│   ├── MyVacations.tsx
│   ├── TaskCard.tsx
│   ├── VacationDetail.tsx
│   └── VacationForm.tsx
├── hooks/                    # Apenas se tiver hooks específicos de férias
│   └── useVacationData.ts
├── types/                    # Apenas se tiver types específicos
│   └── vacation.ts
├── routes.json              # ⭐ CONFIGURAÇÃO DE ROTAS
├── App.tsx                  # ⭐ Lê routes.json, constrói menu
├── App.css                  # ⭐ Apenas estilos específicos
├── index.css
└── main.tsx

❌ NÃO deve ter:
- services/ (usar apiClient do master)
- contexts/ (usar CurrentUserProvider do master)
- hooks/useApi, hooks/useMutation (usar do master)
- Componentes genéricos (Sidebar, PageHeader, etc)
```

## Etapa 7: Criar Componentes Específicos

Cada formulário é um **arquivo separado e independente**.

Veja documentação completa em: [PADRAO_FORMULARIOS_INDIVIDUAIS.md](./PADRAO_FORMULARIOS_INDIVIDUAIS.md)

### Estrutura de um Formulário

```typescript
/**
 * FORM: Solicitar Férias
 * Responsabilidade: Coletar dados + validar + enviar
 * Usado por: SolicitarFeriasView (View/Page)
 */

import { useState } from 'react'
import { useCurrentUser, useMutation } from 'bpms-frontend-master'

export type SolicitarFeriasFormData = {
  startDate: string
  endDate: string
  reason?: string
}

export default function SolicitarFeriasForm() {
  // Hook do master
  const { user } = useCurrentUser()
  const { execute: submit, loading, error } = useMutation('post')
  
  // Estado do formulário
  const [formData, setFormData] = useState<SolicitarFeriasFormData>(...)
  
  // Validação + Submit
  const handleSubmit = async (e: React.FormEvent) => { ... }
  
  // Render
  return <form>...</form>
}
```

### Forms para Criar:

#### 1. **SolicitarFeriasForm.tsx**
```
Quem usa: Servidor/Colaborador
O que faz: Coleta dados de solicitação (datas, motivo) + envia
```

#### 2. **AnalisarSolicitacaoForm.tsx**
```
Quem usa: RH/Admin
O que faz: Aprova/rejeita com parecer + comentários
```

#### 3. **ValidarGestorForm.tsx**
```
Quem usa: Gestor (Manager)
O que faz: Valida impacto operacional + comentário gerencial
```

#### 4. **CancelarFeriasForm.tsx**
```
Quem usa: Servidor ou RH
O que faz: Cancela férias com justificativa
```

Veja exemplos completos em: [PADRAO_FORMULARIOS_INDIVIDUAIS.md](./PADRAO_FORMULARIOS_INDIVIDUAIS.md)

## Etapa 8: Testar Localmente

```bash
# Terminal 1: Teste do master
cd modulos/frontend
npm install
npm run dev
# Deve abrir em http://localhost:3002

# Terminal 2: Teste do projeto férias
cd processos/socilitacao-ferias/frontend
npm install
npm run dev
# Deve abrir em http://localhost:5173 (ou similar)
```

Verifique:
- ✅ Menu carregado a partir de `routes.json`
- ✅ Navegação entre rotas funciona
- ✅ Componentes específicos renderizam
- ✅ Sem erros de import de componentes genéricos

## Etapa 9: Build e Docker

```bash
# Build local
cd processos/socilitacao-ferias/frontend
npm run build

# Dockerfile (reutilize do master ou crie novo similar)
docker build -t bpms-ferias-frontend .
docker run -p 3003:80 bpms-ferias-frontend
```

## Checklist Final

- [ ] `routes.json` criado e bem-formado
- [ ] `App.tsx` lê `routes.json` e constrói menu
- [ ] Componentes específicos movidos para `components/`
- [ ] `App.css` contém APENAS estilos de férias
- [ ] Imports do master funcionam (`CurrentUserProvider`, `useApi`, etc)
- [ ] `npm run dev` executa sem erros
- [ ] `npm run build` gera bundle correto
- [ ] Menu renderiza corretamente
- [ ] Navegação entre rotas funciona
- [ ] Formulários funcionam (POST ao motor)
- [ ] Docker build e run funcionam

## Próximas Etapas

1. Testar comunicação com motor via API
2. Validar persistência de dados no PostgreSQL
3. Criar projetos adicionais usando mesmo padrão
4. Documentar processo para novos projetos
