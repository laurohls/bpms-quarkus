/**
 * ROUTE LOADER UTILITY
 * Dynamically load routes from JSON and build menu
 */

import type { RouteConfig, ProjectRoutes } from '../types/index'

/**
 * Load routes from a routes.json file
 * @param routesPath - Path to routes.json (e.g., '../routes.json')
 * @returns ProjectRoutes with basePath and routes
 */
export async function loadProjectRoutes(routesPath: string): Promise<ProjectRoutes> {
  try {
    const response = await fetch(routesPath)
    if (!response.ok) {
      throw new Error(`Failed to load routes: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading routes:', error)
    return {
      basePath: '/',
      routes: [],
    }
  }
}

/**
 * Convert routes.json config to menu structure
 * @param routes - RouteConfig array
 * @param basePath - Base path for routing
 * @returns Array of menu items with paths
 */
export function buildMenuFromRoutes(routes: RouteConfig[], basePath: string = ''): MenuItem[] {
  return routes
    .filter((route) => !route.path.startsWith('_')) // Skip internal routes (starting with _)
    .map((route) => ({
      name: route.name,
      path: `${basePath}${route.path}`,
      icon: route.icon || '•',
      children:
        route.children && route.children.length > 0
          ? buildMenuFromRoutes(route.children, `${basePath}${route.path}`)
          : undefined,
    }))
}

export type MenuItem = {
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
}

/**
 * Flatten nested menu for easier iteration
 */
export function flattenMenu(menu: MenuItem[]): MenuItem[] {
  return menu.reduce<MenuItem[]>((acc, item) => {
    acc.push(item)
    if (item.children) {
      acc.push(...flattenMenu(item.children))
    }
    return acc
  }, [])
}
