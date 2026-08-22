/**
 * USER CONTEXT - Generic user management
 * Reusable across all projects
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { User } from '../types'

export type CurrentUserCtx = {
  user: User
  users: User[]
  switchUser: (id: string) => void
}

export const CurrentUserContext = createContext<CurrentUserCtx | null>(null)

export const BPMS_USERS: User[] = [
  { id: 'admin', name: 'Administrador do Sistema', role: 'Administrador', initials: 'AD' },
  { id: 'gestor', name: 'Carlos Mendes', role: 'Gestor', initials: 'CM' },
  { id: 'user', name: 'Usuário Padrão', role: 'Servidor', initials: 'UP' },
]

const CURRENT_USER_KEY = 'bpms.currentUserId'

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be called within CurrentUserProvider')
  return ctx
}

export function CurrentUserProvider({
  children,
  users = BPMS_USERS,
}: {
  children: React.ReactNode
  users?: User[]
}) {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY)
      return users.find((u) => u.id === saved) ?? users[0]
    } catch {
      return users[0]
    }
  }

  const [user, setUser] = useState<User>(getInitial)

  const switchUser = useCallback(
    (id: string) => {
      const found = users.find((u) => u.id === id) ?? users[0]
      try {
        localStorage.setItem(CURRENT_USER_KEY, found.id)
      } catch {
        /* ignore */
      }
      setUser(found)
    },
    [users],
  )

  const value = useMemo(() => ({ user, users, switchUser }), [user, users, switchUser])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}
