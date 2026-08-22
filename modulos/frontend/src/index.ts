/**
 * INDEX.TS - Master Frontend Main Export
 * 
 * This file serves as the main entry point for the master frontend package.
 * All components, hooks, services, and utilities are exported from here.
 */

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

// Constants
export { BPMS_USERS } from './contexts/UserContext'
