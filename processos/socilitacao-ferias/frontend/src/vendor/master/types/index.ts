/**
 * MASTER TYPES
 * Centralized type definitions for all projects
 */

// ============================================================
// USER & AUTHENTICATION
// ============================================================

export type User = {
  id: string
  name: string
  role: string
  initials: string
}

// ============================================================
// ROUTING
// ============================================================

export type RouteConfig = {
  name: string
  path: string
  component: string
  icon?: string
  children?: RouteConfig[]
}

export type ProjectRoutes = {
  basePath: string
  routes: RouteConfig[]
}

// ============================================================
// API & DATA
// ============================================================

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  pageSize: number
}>
