/**
 * TaskDetailView.tsx
 * Detalhe de tarefa - usa lib compartilhada modulos/frontend (taskService)
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { taskService, type TaskDetails } from 'bpms-frontend-master'
import { useCurrentUser } from 'bpms-frontend-master'

export default function TaskDetailView() {
  const { id: taskId } = useParams<{ id: string }>()
  // Compatibilidade com rota legacy /tarefa/:id e /tarefa/:taskId
  const { taskId: altId } = useParams<{ taskId: string }>()
  const resolvedId = taskId ?? altId
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const [detail, setDetail] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!resolvedId) {
      setError('ID da tarefa não fornecido')
      setLoading(false)
      return
    }
    const fetchTask = async () => {
      try {
        setLoading(true)
        const data = await taskService.getTask(resolvedId)
        if (!data) throw new Error('Tarefa não encontrada')
        setDetail(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tarefa')
        setDetail(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [resolvedId])

  const handleClaim = async () => {
    if (!resolvedId) return
    try {
      setSubmitting(true)
      await taskService.claim(resolvedId, user.id)
      const refreshed = await taskService.getTask(resolvedId)
      setDetail(refreshed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reivindicar tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnclaim = async () => {
    if (!resolvedId) return
    try {
      setSubmitting(true)
      await taskService.unclaim(resolvedId)
      const refreshed = await taskService.getTask(resolvedId)
      setDetail(refreshed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desistir da tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async () => {
    if (!resolvedId) return
    try {
      setSubmitting(true)
      // Lib: complete envia variables para motor; RH usa rhDecision/rhResponse
      await taskService.complete(resolvedId, { completedBy: user.id })
      navigate('/atividades', { replace: true })
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

  if (error || !detail) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Erro:</strong>
          <div className="error-details">{error || 'Tarefa não encontrada'}</div>
        </div>
        <button className="form-button primary" onClick={() => navigate('/atividades')}>
          Voltar para Atividades
        </button>
      </div>
    )
  }

  const task = detail.task
  const vars = detail.processVariables as Record<string, unknown>

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/atividades')}>
          ← Voltar
        </button>
        <h1>{task.name}</h1>
        <span className="status-badge">{task.taskDefinitionKey}</span>
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
          <label className="form-label">Assignee</label>
          <p>{task.assignee || 'Não atribuído'}</p>
        </div>
        <div className="form-group">
          <label className="form-label">ProcessInstance</label>
          <p>{detail.processInstance?.id ?? task.processInstanceId}</p>
        </div>
        <div className="form-group">
          <label className="form-label">Criação</label>
          <p>{new Date(task.createTime).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {vars && Object.keys(vars).length > 0 && (
        <div className="form-section">
          <h2 className="form-section-title">Variáveis do Processo</h2>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(vars, null, 2)}
          </pre>
        </div>
      )}

      <div className="form-button-group">
        {task.assignee === null ? (
          <button className="form-button primary" onClick={handleClaim} disabled={submitting}>
            {submitting ? 'Reivindicando...' : 'Reivindicar Tarefa'}
          </button>
        ) : (
          <>
            <button className="form-button secondary" onClick={handleUnclaim} disabled={submitting}>
              {submitting ? 'Desistindo...' : 'Desistir'}
            </button>
            <button className="form-button primary" onClick={handleComplete} disabled={submitting}>
              {submitting ? 'Completando...' : 'Completar Tarefa'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
