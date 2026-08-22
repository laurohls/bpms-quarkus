/**
 * BPMS FÉRIAS - Frontend Refatorado
 * 
 * Arquitetura:
 * - Master imports: Componentes, Context, Hooks, Services, Utils
 * - Routes: Carregadas de routes.json (configuração)
 * - Components: Organizados em forms/, views/, shared/
 * - Cada formulário é um arquivo separado com responsabilidade única
 */

import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  Sidebar,
  PageHeader,
  AppFooter,
  CurrentUserProvider,
  loadProjectRoutes,
  buildMenuFromRoutes,
  type ProjectRoutes,
} from 'bpms-frontend-master'
import './vendor/master/index.css'
import './vendor/master/App.css'
import './App.css'

// Import de views (Páginas)
import SolicitarFeriasView from './components/views/SolicitarFeriasView'
import TaskListView from './components/views/TaskListView'
import TaskDetailView from './components/views/TaskDetailView'
import MinhasSolicitacoesView from './components/views/MinhasSolicitacoesView'
import ProcessosView from './components/views/ProcessosView'

// Import de formulários
import AnalisarSolicitacaoForm from './components/forms/AnalisarSolicitacaoForm'
import ValidarGestorForm from './components/forms/ValidarGestorForm'
import CancelarFeriasForm from './components/forms/CancelarFeriasForm'

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // Views
  SolicitarFeriasView,
  TaskListView,
  TaskDetailView,
  MinhasSolicitacoesView,
  ProcessosView,
  
  // Forms
  AnalisarSolicitacaoForm,
  ValidarGestorForm,
  CancelarFeriasForm,
}

function AppLayout({ routes }: { routes: ProjectRoutes }) {
  const menuItems = buildMenuFromRoutes(routes.routes, routes.basePath)

  return (
    <>
      <div className="app-shell">
        <Sidebar>
          <span className="nav-label">Menu</span>
          {menuItems.map((item: any) => (
            <a key={item.path} href={item.path} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </Sidebar>

        <main className="main-content">
          <PageHeader
            title="Solicitação de Férias"
            subtitle="DETRAN-MS · Sistema BPMS"
            rightContent={
              <div className="header-meta">
                <span className="online-dot" title="Sistema online" />
                Conectado
              </div>
            }
          />

          <div className="page-content">
            <Routes>
              {routes.routes.map((route: any) => {
                const Component = COMPONENT_MAP[route.component as keyof typeof COMPONENT_MAP]
                if (!Component) {
                  console.warn(`Componente ${route.component} não encontrado`)
                  return null
                }
                return <Route key={route.path} path={route.path} element={<Component />} />
              })}
            </Routes>
          </div>
        </main>
      </div>

      <AppFooter />
    </>
  )
}

export default function App() {
  const [routes, setRoutes] = useState<ProjectRoutes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjectRoutes('/routes.json')
      .then((config: any) => {
        if (!config || !config.routes) {
          throw new Error('Routes config is empty')
        }
        setRoutes(config)
        setLoading(false)
      })
      .catch((err: any) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar rotas')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Carregando aplicação...</p>
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
    <div id="app">
      <CurrentUserProvider>
        <AppLayout routes={routes} />
      </CurrentUserProvider>
    </div>
  )
}
