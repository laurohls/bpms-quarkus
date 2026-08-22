/**
 * Hooks específicos do processo de Férias
 */

export function daysBetween(start: string, end: string): number {
  const parseDate = (v?: string | number | Date): Date | null => {
    if (!v) return null
    if (v instanceof Date) return v
    if (typeof v === 'number') return new Date(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
      const [y, m, d] = String(v).split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date(String(v))
  }
  const a = parseDate(start)
  const b = parseDate(end)
  if (!a || !b || Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000) + 1)
}

export const parseDate = (v?: string | number | Date): Date | null => {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v)
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
    const [y, m, d] = String(v).split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(String(v))
}

export const formatDate = (value?: string): string => {
  const dateFmt = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const d = parseDate(value)
  return d && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : '—'
}

export const label = (value?: string): string => value?.replaceAll('_', ' ') || '—'
