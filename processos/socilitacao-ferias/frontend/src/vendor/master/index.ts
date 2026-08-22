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

// Constants
export { BPMS_USERS } from './contexts/UserContext'
