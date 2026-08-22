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
export type { User, RouteConfig, ProjectRoutes, ApiResponse, PaginatedResponse } from './types'

// Services
export { apiClient } from './services/api'

// Hooks
export { useApi, useMutation, useLocalStorage, useDebounce, usePrevious } from './hooks'

// Utils
export { loadProjectRoutes, buildMenuFromRoutes, flattenMenu } from './utils/routeLoader'
export type { MenuItem } from './utils/routeLoader'

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
import './App.css'

export default function DemoApp() {
  return (
    <CurrentUserProvider>
      <div className="app-shell">
        <Sidebar>
          <span className="nav-label">Menu</span>
          <button className="nav-item active">
            <span className="nav-icon">◈</span> Dashboard
          </button>
          <button className="nav-item">
            <span className="nav-icon">✓</span> Tarefas
          </button>
        </Sidebar>
        <main className="main-content">
          <PageHeader title="Master Frontend" subtitle="Template Base" />
          <div style={{ padding: '40px' }}>
            <h2>Layout Master - Apenas para Teste</h2>
            <p>
              Este é o template padrão de layout para todos os frontends do BPMS. Cada projeto herda este
              layout e adiciona seus próprios componentes e lógica de negócio.
            </p>
            <h3>Componentes Disponíveis:</h3>
            <ul>
              <li>
                <code>Sidebar</code> — Navegação lateral (aceita children)
              </li>
              <li>
                <code>PageHeader</code> — Cabeçalho da página
              </li>
              <li>
                <code>AppFooter</code> — Rodapé (customizável)
              </li>
              <li>
                <code>CurrentUserProvider</code> — Context de usuário
              </li>
              <li>
                <code>useCurrentUser()</code> — Hook para acessar usuário
              </li>
            </ul>
            <h3>Services:</h3>
            <ul>
              <li>
                <code>apiClient</code> — Cliente HTTP genérico (get, post, put, delete, getPaginated)
              </li>
            </ul>
            <h3>Hooks:</h3>
            <ul>
              <li>
                <code>useApi</code> — Para GET requests
              </li>
              <li>
                <code>useMutation</code> — Para POST/PUT/DELETE requests
              </li>
              <li>
                <code>useLocalStorage</code> — Persistência em localStorage
              </li>
              <li>
                <code>useDebounce</code> — Debounce de valores
              </li>
            </ul>
            <h3>Utils:</h3>
            <ul>
              <li>
                <code>loadProjectRoutes</code> — Carrega routes.json dinamicamente
              </li>
              <li>
                <code>buildMenuFromRoutes</code> — Converte routes.json em menu estruturado
              </li>
            </ul>
          </div>
        </main>
        <AppFooter />
      </div>
    </CurrentUserProvider>
  )
}
