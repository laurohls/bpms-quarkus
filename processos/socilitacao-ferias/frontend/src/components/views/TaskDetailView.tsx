/**
 * TaskDetailView.tsx
 * Página que mostra os detalhes de uma atividade específica
 * Permite ao usuário reivindicar (claim), rejeitar ou completar a atividade
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from 'bpms-frontend-master'
import type { TaskDetails } from '../../types'

export default function TaskDetailView() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { get, post } = useApi()

  useEffect(() => {
    if (!taskId) {
      setError('ID da tarefa não fornecido')
      setLoading(false)
      return
    }

    const fetchTask = async () => {
      try {
        setLoading(true)
        const response = await get(`/api/ferias/tasks/${taskId}`)
        setTask(response.data || null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tarefa')
        setTask(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId, get])

  const handleClaim = async () => {
    if (!taskId) return

    try {
      setSubmitting(true)
      await post(`/api/ferias/tasks/${taskId}/claim`, {})
      setTask((prev) => (prev ? { ...prev, assignee: 'self' } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reivindicar tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnclaim = async () => {
    if (!taskId) return

    try {
      setSubmitting(true)
      await post(`/api/ferias/tasks/${taskId}/unclaim`, {})
      setTask((prev) => (prev ? { ...prev, assignee: null } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desistir da tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async () => {
    if (!taskId) return

    try {
      setSubmitting(true)
      await post(`/api/ferias/tasks/${taskId}/complete`, {})
      navigate('/tarefas', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar tarefa')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Carregando tarefa...</p>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Erro:</strong>
          <div className="error-details">{error || 'Tarefa não encontrada'}</div>
        </div>
        <button
          className="form-button primary"
          onClick={() => navigate('/tarefas')}
        >
          Voltar para Tarefas
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => navigate('/tarefas')}
        >
          ← Voltar
        </button>
        <h1>{task.name}</h1>
        <span className={`status-badge ${task.status}`}>{task.status}</span>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="form-section">
        <h2 className="form-section-title">Informações da Tarefa</h2>

        <div className="form-group">
          <label className="form-label">ID</label>
          <p>{task.id}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <p>{task.description || '-'}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Atribuído para</label>
          <p>{task.assignee || 'Não atribuído'}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Data de Criação</label>
          <p>
            {task.createdAt
              ? new Date(task.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '-'}
          </p>
        </div>

        {task.dueDate && (
          <div className="form-group">
            <label className="form-label">Data de Vencimento</label>
            <p>
              {new Date(task.dueDate).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      {task.data && Object.keys(task.data).length > 0 && (
        <div className="form-section">
          <h2 className="form-section-title">Dados da Solicitação</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(task.data, null, 2)}
          </pre>
        </div>
      )}

      <div className="form-button-group">
        {task.assignee === null ? (
          <button
            className="form-button primary"
            onClick={handleClaim}
            disabled={submitting}
          >
            {submitting ? 'Reivindicando...' : 'Reivindicar Tarefa'}
          </button>
        ) : (
          <>
            <button
              className="form-button secondary"
              onClick={handleUnclaim}
              disabled={submitting}
            >
              {submitting ? 'Desistindo...' : 'Desistir'}
            </button>
            <button
              className="form-button primary"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? 'Completando...' : 'Completar Tarefa'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
