/**
 * TaskListView.tsx
 * Página que lista as atividades/tarefas disponíveis para o usuário
 * Cada tarefa pode ser visualizada em detalhe ou reclamada (claim)
 */

import { useEffect, useState } from 'react'
import { useApi } from 'bpms-frontend-master'
import TaskCard from '../shared/TaskCard'
import type { Task } from '../../types'

export default function TaskListView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all')

  const { get } = useApi()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await get('/api/ferias/tasks')
        const data = response.data || []
        setTasks(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas')
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [get])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'available') return task.assignee === null
    if (filter === 'claimed') return task.assignee !== null
    return true
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Carregando tarefas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Erro ao carregar tarefas:</strong>
          <div className="error-details">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Minhas Atividades</h1>
        <p>Você tem {filteredTasks.length} tarefas</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({tasks.length})
        </button>
        <button
          className={`filter-button ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Disponíveis ({tasks.filter((t) => t.assignee === null).length})
        </button>
        <button
          className={`filter-button ${filter === 'claimed' ? 'active' : ''}`}
          onClick={() => setFilter('claimed')}
        >
          Minhas ({tasks.filter((t) => t.assignee !== null).length})
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma tarefa encontrada</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
