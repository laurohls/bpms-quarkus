/**
 * AnalisarFeriasView.tsx
 * View para RH analisar solicitacoes de ferias - usa lib compartilhada modulos/frontend
 */

import { useState, useEffect } from 'react'
import { taskService, type TaskSummary, type TaskDetails } from 'bpms-frontend-master'
import AnalisarSolicitacaoForm from '../forms/AnalisarSolicitacaoForm'

export default function AnalisarFeriasView() {
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [selected, setSelected] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pendentes' | 'completas'>('pendentes')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        // Lib compartilhada: busca tarefas ativas do processo "process"
        const data = await taskService.listTasksByProcess('process')
        // Filtra apenas RHReviewTask (candidateGroups RH)
        const rhTasks = data.filter((t) => t.taskDefinitionKey === 'RHReviewTask')
        setTasks(rhTasks.length > 0 ? rhTasks : data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const handleSelect = async (taskId: string) => {
    try {
      const details = await taskService.getTask(taskId)
      setSelected(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes')
    }
  }

  if (selected) {
    const vars = selected.processVariables as Record<string, unknown>
    return (
      <div className="page-content">
        <div className="task-detail">
          <button
            className="back-button"
            onClick={() => setSelected(null)}
            style={{ marginBottom: '20px', padding: '8px 16px' }}
          >
            ← Voltar para lista
          </button>

          <div className="form-section">
            <h3 className="form-section-title">Dados da Solicitação</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Funcionário</label>
                <span>{String(vars.employeeName ?? vars.nome ?? '-')}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{String(vars.email ?? '-')}</span>
              </div>
              <div className="detail-item">
                <label>Período</label>
                <span>
                  {String(vars.startDate ?? vars.dataInicio ?? '-')} até{' '}
                  {String(vars.endDate ?? vars.dataFim ?? '-')}
                </span>
              </div>
              <div className="detail-item">
                <label>Dias</label>
                <span>{String(vars.days ?? vars.dias ?? '-')}</span>
              </div>
            </div>
            {vars.reason && (
              <div style={{ marginTop: '20px' }}>
                <label className="form-label">Motivo</label>
                <div className="form-static-textarea">{String(vars.reason)}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px' }}>
            <AnalisarSolicitacaoForm
              taskId={selected.task.id}
              solicitacaoId={selected.processInstance?.id ?? selected.task.processInstanceId}
              onSuccess={() => {
                setSelected(null)
                window.location.reload()
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <h1 style={{ marginBottom: '24px' }}>Solicitações de Férias para Análise</h1>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          className={`filter-button ${filter === 'pendentes' ? 'active' : ''}`}
          onClick={() => setFilter('pendentes')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'pendentes' ? '#004f9f' : '#fff',
            color: filter === 'pendentes' ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          Pendentes ({tasks.length})
        </button>
        <button
          className={`filter-button ${filter === 'completas' ? 'active' : ''}`}
          onClick={() => setFilter('completas')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: filter === 'completas' ? '#004f9f' : '#fff',
            color: filter === 'completas' ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          Analisadas (0)
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }} />
      ) : tasks.length === 0 ? (
        <div className="info-message" style={{ textAlign: 'center', padding: '40px' }}>
          <strong>ℹ️ Nenhuma solicitação pendente</strong>
          <p>Volte mais tarde para verificar novas solicitações</p>
        </div>
      ) : (
        <div className="tasks-grid" style={{ display: 'grid', gap: '12px' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="task-card"
              onClick={() => handleSelect(task.id)}
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#004f9f' }}>{task.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>ID: {task.id}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    Criado: {new Date(task.createTime).toLocaleDateString('pt-BR')}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
                    {task.taskDefinitionKey}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    alignSelf: 'start',
                  }}
                >
                  PENDENTE
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
