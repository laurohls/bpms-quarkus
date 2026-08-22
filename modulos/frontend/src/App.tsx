/**
 * MASTER LAYOUT LIBRARY - MAIN EXPORTS
 * 
 * This master exports everything needed by child projects:
 * - Layout components (Sidebar, PageHeader, AppFooter)
 * - User context and hooks
 * - Utility functions
 * - Types
 * 
 * Each project imports from master and builds on top of it.
 */

// ============================================================
// RE-EXPORT ALL MASTER COMPONENTS & UTILITIES
// ============================================================

// Layout Components
export { Sidebar, PageHeader, AppFooter } from './components/Layout'
export type { SidebarProps, PageHeaderProps, AppFooterProps } from './components/Layout'

// User Context
export { CurrentUserProvider, useCurrentUser } from './contexts/UserContext'
export type { CurrentUserCtx } from './contexts/UserContext'

// Types
export type { User, RouteConfig, ProjectRoutes, MenuSection, MixedMenu, ApiResponse, PaginatedResponse } from './types'
export type {
  ProcessInstanceSummary,
  CreateProcessRequest,
  ProcessDefinitionSummary,
  ActivityHistorySummary,
  TaskSummary,
  TaskDetails,
  ProcessInstanceDetails,
  ClaimTaskRequest,
  CompleteTaskRequest,
} from './types/bpms'

// Services
export { apiClient } from './services/api'
export { motorClient } from './services/motorClient'
export { processService } from './services/processService'
export { taskService } from './services/taskService'

// Hooks
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious } from './hooks'

// Utils
export {
  loadProjectRoutes,
  buildMenuFromRoutes,
  flattenMenu,
  getMasterRoutes,
  buildMenuSection,
  buildMixedMenu,
  loadMixedRoutes,
  loadMasterAndProject,
} from './utils/routeLoader'
export type { MenuItem } from './utils/routeLoader'
export { default as masterRoutes } from './config/masterRoutes.json'

// ============================================================
// CONSTANTS
// ============================================================

export { BPMS_USERS } from './contexts/UserContext'

// ============================================================
// DEMO APP (for testing master template only)
// Remove this in production master usage
// ============================================================

import { Sidebar, PageHeader, AppFooter } from './components/Layout'
import { CurrentUserProvider } from './contexts/UserContext'
import { getMasterRoutes, buildMixedMenu } from './utils/routeLoader'
import './App.css'

export default function DemoApp() {
  // Demo: menu misto Master + projeto exemplo (JSON)
  const master = getMasterRoutes()
  const exemploProjeto = {
    basePath: '/processos/socilitacao-ferias',
    projectName: 'Solicitação de Férias',
    routes: [
      { name: 'Atividades', path: '/atividades', component: 'TaskListView', icon: '◈' },
      { name: 'Nova Solicitação', path: '/solicitar', component: 'SolicitarFeriasView', icon: '＋' },
    ],
  }
  const mixed = buildMixedMenu(master, [exemploProjeto])

  return (
    <CurrentUserProvider>
      <div className="app-shell">
        <Sidebar>
          {/* Secao Master (gerada da lib) */}
          <span className="nav-label">Master</span>
          {mixed.master.items.map((item) => (
            <button key={item.path} className="nav-item">
              <span className="nav-icon">{item.icon}</span> {item.name}
            </button>
          ))}
          {/* Secoes por projeto (filhos agregam via JSON) */}
          {mixed.projects.map((section) => (
            <div key={section.basePath}>
              <span className="nav-label">{section.title}</span>
              {section.items.map((item) => (
                <button key={item.path} className="nav-item">
                  <span className="nav-icon">{item.icon}</span> {item.name}
                </button>
              ))}
            </div>
          ))}
        </Sidebar>
        <main className="main-content">
          <PageHeader title="Master Frontend" subtitle="Template Base - Menu Misto" />
          <div style={{ padding: '40px' }}>
            <h2>Layout Master - Menu Misto (JSON)</h2>
            <p>
              Este template demonstra <strong>menu misto</strong>: Master gera menus base via{' '}
              <code>masterRoutes.json</code> + projetos filhos agregam seções via{' '}
              <code>routes.json</code> separado por projeto.
            </p>
            <h3>Componentes:</h3>
            <ul>
              <li>
                <code>Sidebar</code> — Renderiza seções Master + Projetos
              </li>
              <li>
                <code>getMasterRoutes()</code> — JSON estático da lib
              </li>
              <li>
                <code>loadMixedRoutes(['/routes.json'])</code> — Master + filhos (fetch)
              </li>
              <li>
                <code>buildMixedMenu(master, projects)</code> — Junta menus
              </li>
            </ul>
            <h3>Services (lib):</h3>
            <ul>
              <li>
                <code>processService</code> / <code>taskService</code> — Motor 81
              </li>
            </ul>
            <h3>Exemplo JSON filho (routes.json):</h3>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(exemploProjeto, null, 2)}
            </pre>
            <h3>MixedMenu gerado:</h3>
            <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(mixed, null, 2)}
            </pre>
          </div>
        </main>
        <AppFooter />
      </div>
    </CurrentUserProvider>
  )
}
