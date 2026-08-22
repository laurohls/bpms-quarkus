/**
 * LAYOUT COMPONENTS - Reusable across all projects
 */

import { useCurrentUser } from '../contexts/UserContext'

export interface SidebarProps {
  children?: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const ctx = useCurrentUser()

  return (
    <aside className="sidebar">
      {/* Sidebar Top: Brand */}
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">◈</div>
          <div>
            <strong>BPMS</strong>
            <small>Master Layout</small>
          </div>
        </div>
      </div>

      {/* Navigation: Customizable by project */}
      {children && <nav className="sidebar-nav">{children}</nav>}

      {/* Sidebar Bottom: User */}
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{ctx.user.initials}</div>
          <div className="user-info">
            <strong>{ctx.user.name}</strong>
            <small>{ctx.user.role}</small>
          </div>
        </div>

        <label className="user-switch">
          <span>Trocar usuário</span>
          <select value={ctx.user.id} onChange={(e) => ctx.switchUser(e.target.value)}>
            {ctx.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  )
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
}

export function PageHeader({ title, subtitle, rightContent }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {subtitle && <div className="kicker">{subtitle}</div>}
        <h1>{title}</h1>
      </div>
      {rightContent || (
        <div className="header-meta">
          <span className="online-dot" title="Sistema online" />
          Conectado
        </div>
      )}
    </div>
  )
}

export interface AppFooterProps {
  children?: React.ReactNode
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="app-footer">
      {children || (
        <div className="app-footer-inner">
          <div className="footer-brand">
            <div>
              <strong>BPMS</strong>
              <small>Business Process Management System</small>
            </div>
          </div>
          <div className="footer-links">
            <span>Sistema administrativo</span>
          </div>
        </div>
      )}
    </footer>
  )
}
