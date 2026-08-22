/**
 * ROUTE LOADER UTILITY
 * Dynamically load routes from JSON and build menu
 */

import type { RouteConfig, ProjectRoutes, MenuSection, MixedMenu } from '../types/index'
import masterRoutesJson from '../config/masterRoutes.json'

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
function joinPath(base: string, path: string): string {
  if (!base || base === '/') return path.startsWith('/') ? path : '/' + path
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  const p = path.startsWith('/') ? path : '/' + path
  return `${b}${p}`
}

export function buildMenuFromRoutes(routes: RouteConfig[], basePath: string = ''): MenuItem[] {
  return routes
    .filter((route) => !route.path.startsWith('_')) // Skip internal routes (starting with _)
    .map((route) => ({
      name: route.name,
      path: joinPath(basePath, route.path),
      icon: route.icon || '•',
      children:
        route.children && route.children.length > 0
          ? buildMenuFromRoutes(route.children, joinPath(basePath, route.path))
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

// ============================================================
// MIXED MENU (Master + Projetos filhos)
// ============================================================

/**
 * Master routes estaticas (import JSON da lib)
 */
export function getMasterRoutes(): ProjectRoutes {
  return masterRoutesJson as ProjectRoutes
}

/**
 * Constroi secao de menu a partir de ProjectRoutes
 */
export function buildMenuSection(
  projectRoutes: ProjectRoutes,
  title: string,
): MenuSection {
  return {
    title,
    basePath: projectRoutes.basePath,
    items: buildMenuFromRoutes(projectRoutes.routes, projectRoutes.basePath),
  }
}

/**
 * Constroi MixedMenu a partir de master + 1..N projetos
 */
export function buildMixedMenu(
  master: ProjectRoutes,
  projects: ProjectRoutes[],
): MixedMenu {
  return {
    master: buildMenuSection(master, 'Master'),
    projects: projects.map((p) =>
      buildMenuSection(p, p.projectName ?? p.basePath ?? 'Projeto'),
    ),
  }
}

/**
 * Carrega MixedMenu dinamicamente:
 * - master vem do JSON estatico da lib
 * - cada projeto vem de fetch('/routes.json') ou caminho custom
 *
 * @example loadMixedRoutes(['/routes.json', '/processos/outro/routes.json'])
 */
export async function loadMixedRoutes(
  projectRoutesPaths: string[],
): Promise<MixedMenu> {
  const master = getMasterRoutes()
  const projects = await Promise.all(
    projectRoutesPaths.map((path) => loadProjectRoutes(path)),
  )
  // Injeta nome do projeto a partir do basePath se nao vier no JSON
  const enriched = projects.map((p) => ({
    ...p,
    projectName: p.projectName ?? deriveProjectName(p.basePath),
  }))
  return buildMixedMenu(master, enriched)
}

/**
 * Atalho para caso mais comum: master + 1 projeto filho
 */
export async function loadMasterAndProject(
  projectRoutesPath: string = '/routes.json',
): Promise<MixedMenu> {
  return loadMixedRoutes([projectRoutesPath])
}

function deriveProjectName(basePath: string): string {
  const seg = basePath.split('/').filter(Boolean).pop()
  if (!seg) return 'Projeto'
  return seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
