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
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  PageHeader,
  AppFooter,
  CurrentUserProvider,
  loadMasterAndProject,
  loadProjectRoutes,
  getMasterRoutes,
  type MixedMenu,
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
import AnalisarFeriasView from './components/views/AnalisarFeriasView'

// Import de formulários
import AnalisarSolicitacaoForm from './components/forms/AnalisarSolicitacaoForm'
import ValidarGestorForm from './components/forms/ValidarGestorForm'
import CancelarFeriasForm from './components/forms/CancelarFeriasForm'
import ConsultarRespostaForm from './components/forms/ConsultarRespostaForm'

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // Views
  SolicitarFeriasView,
  TaskListView,
  TaskDetailView,
  MinhasSolicitacoesView,
  ProcessosView,
  AnalisarFeriasView,
  
  // Forms
  AnalisarSolicitacaoForm,
  ValidarGestorForm,
  CancelarFeriasForm,
  ConsultarRespostaForm,
}

function AppLayout({ mixed, projectRoutes }: { mixed: MixedMenu; projectRoutes: ProjectRoutes }) {
  const navigate = useNavigate()

  return (
    <>
      <div className="app-shell">
        <Sidebar>
          {/* Master - gerado pela lib (JSON estatico) */}
          <span className="nav-label">{mixed.master.title}</span>
          {mixed.master.items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="nav-item"
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', width: '100%', textAlign: 'left' }}
            >
              <span className="nav-icon">{item.icon}</span> {item.name}
            </button>
          ))}
          {/* Projetos filhos - agregados via JSON separado por projeto */}
          {mixed.projects.map((section) => (
            <div key={section.basePath}>
              <span className="nav-label">{section.title}</span>
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="nav-item"
                  style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">{item.icon}</span> {item.name}
                </button>
              ))}
            </div>
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
              {/* Master routes (lib) - Início, Minhas Tarefas, Processos */}
              {(() => {
                const master = getMasterRoutes()
                return master.routes.map((route) => {
                  // Mapeia componentes master para componentes existentes no filho
                  const masterCompMap: Record<string, string> = {
                    DashboardView: 'TaskListView', // Início -> mostra atividades
                    TaskListView: 'TaskListView',
                    ProcessosView: 'ProcessosView',
                  }
                  const compName = masterCompMap[route.component] ?? route.component
                  const Component = COMPONENT_MAP[compName as keyof typeof COMPONENT_MAP]
                  if (!Component) return null
                  const fullPath = route.path // master basePath "/" -> path ja absoluto
                  return <Route key={`master-${route.path}`} path={fullPath} element={<Component />} />
                })
              })()}
              {/* Rotas reais do projeto filho via routes.json (usa basePath para URL completa) */}
              {projectRoutes.routes.map((route) => {
                const Component = COMPONENT_MAP[route.component as keyof typeof COMPONENT_MAP]
                if (!Component) {
                  console.warn(`Componente ${route.component} não encontrado`)
                  return null
                }
                // Usa basePath do projeto para URL completa (ex: /processos/socilitacao-ferias/solicitar)
                const base = projectRoutes.basePath.endsWith('/')
                  ? projectRoutes.basePath.slice(0, -1)
                  : projectRoutes.basePath
                const p = route.path.startsWith('/') ? route.path : '/' + route.path
                const fullPath = `${base}${p}`
                return <Route key={route.path} path={fullPath} element={<Component />} />
              })}
              {/* Fallback: rotas internas */}
              <Route
                path={`${projectRoutes.basePath}/tarefa/:id`}
                element={<TaskDetailView />}
              />
              <Route path="/tarefa/:id" element={<TaskDetailView />} />
              <Route path="/tarefa/:taskId" element={<TaskDetailView />} />
            </Routes>
          </div>
        </main>
      </div>

      <AppFooter />
    </>
  )
}

export default function App() {
  const [mixed, setMixed] = useState<MixedMenu | null>(null)
  const [projectRoutes, setProjectRoutes] = useState<ProjectRoutes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Menu misto: Master (lib) + projeto filho (routes.json) - JSON separado por projeto
    Promise.all([loadMasterAndProject('/routes.json'), loadProjectRoutes('/routes.json')])
      .then(([menu, proj]) => {
        if (!menu || !menu.projects.length) throw new Error('Routes config is empty')
        if (!proj || !proj.routes) throw new Error('Project routes empty')
        setMixed(menu)
        setProjectRoutes(proj)
        setLoading(false)
      })
      .catch((err: unknown) => {
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

  if (error || !mixed || !projectRoutes) {
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
        <AppLayout mixed={mixed} projectRoutes={projectRoutes} />
      </CurrentUserProvider>
    </div>
  )
}
