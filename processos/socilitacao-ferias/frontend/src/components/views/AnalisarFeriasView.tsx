/**
 * AnalisarFeriasView.tsx
 * View para RH analisar solicitações de férias em fila
 * Lista tarefas pendentes e fornece interface de análise
 */

import { useState, useEffect } from 'react'
import { useApi } from 'bpms-frontend-master'
import AnalisarSolicitacaoForm from '../forms/AnalisarSolicitacaoForm'
import type { SolicitacaoFerias, Task } from '../../types'

interface SolicitacaoComTask extends SolicitacaoFerias {
  taskId: string
  createdAt: string
}

export default function AnalisarFeriasView() {
  const [tarefas, setTarefas] = useState<SolicitacaoComTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pendentes' | 'completas'>('pendentes')

  const { get } = useApi()

  // Carregar tarefas do RH
  useEffect(() => {
    const fetchTarefas = async () => {
      try {
        setLoading(true)
        const data = await get('/api/ferias/tasks/rh')
        setTarefas(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas')
      } finally {
        setLoading(false)
      }
    }

    fetchTarefas()
  }, [get])

  const tarefasSelecionadas = tarefas.filter((t) => {
    if (filter === 'pendentes') return !t.taskId // ou verificar status
    return !!t.taskId
  })

  if (selectedTaskId) {
    const tarefa = tarefas.find((t) => t.taskId === selectedTaskId)
    if (tarefa) {
      return (
        <div className="page-content">
          <div className="task-detail">
            <button
              className="back-button"
              onClick={() => setSelectedTaskId(null)}
              style={{ marginBottom: '20px', padding: '8px 16px' }}
            >
              ← Voltar para lista
            </button>

            {/* Detalhes da Solicitação */}
            <div className="form-section">
              <h3 className="form-section-title">Dados da Solicitação</h3>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Funcionário</label>
                  <span>{tarefa.nomeFuncionario}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{tarefa.emailFuncionario}</span>
                </div>
                <div className="detail-item">
                  <label>Departamento</label>
                  <span>{tarefa.departamento}</span>
                </div>
                <div className="detail-item">
                  <label>Matrícula</label>
                  <span>{tarefa.matricula}</span>
                </div>
              </div>

              <div className="detail-grid" style={{ marginTop: '20px' }}>
                <div className="detail-item">
                  <label>Data Início</label>
                  <span>{new Date(tarefa.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="detail-item">
                  <label>Data Fim</label>
                  <span>{new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="detail-item">
                  <label>Dias Solicitados</label>
                  <span>{tarefa.diasSolicitados} dias</span>
                </div>
              </div>

              {tarefa.motivo && (
                <div style={{ marginTop: '20px' }}>
                  <label className="form-label">Motivo</label>
                  <div className="form-static-textarea">{tarefa.motivo}</div>
                </div>
              )}
            </div>

            {/* Formulário de Análise */}
            <div style={{ marginTop: '30px' }}>
              <AnalisarSolicitacaoForm
                taskId={selectedTaskId}
                solicitacaoId={tarefa.id}
                onSuccess={() => {
                  setSelectedTaskId(null)
                  // Recarregar tarefas
                  window.location.reload()
                }}
              />
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="page-content">
      <h1 style={{ marginBottom: '24px' }}>Solicitações de Férias para Análise</h1>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Filtro */}
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
          Pendentes ({tarefas.filter((t) => !t.taskId).length})
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
          Analisadas ({tarefas.filter((t) => t.taskId).length})
        </button>
      </div>

      {/* Lista de Tarefas */}
      {loading ? (
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }} />
      ) : tarefasSelecionadas.length === 0 ? (
        <div className="info-message" style={{ textAlign: 'center', padding: '40px' }}>
          <strong>ℹ️ Nenhuma solicitação {filter === 'pendentes' ? 'pendente' : 'analisada'}</strong>
          <p>Volte mais tarde para verificar novas solicitações</p>
        </div>
      ) : (
        <div className="tasks-grid" style={{ display: 'grid', gap: '12px' }}>
          {tarefasSelecionadas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="task-card"
              onClick={() => setSelectedTaskId(tarefa.taskId)}
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#fff',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = '#f9f9f9'
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = '#fff'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#004f9f' }}>
                    {tarefa.nomeFuncionario}
                  </h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    📧 {tarefa.emailFuncionario}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    📅{' '}
                    {new Date(tarefa.dataInicio).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(tarefa.dataFim).toLocaleDateString('pt-BR')}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    ⏱️ {tarefa.diasSolicitados} dias solicitados
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    PENDENTE
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
