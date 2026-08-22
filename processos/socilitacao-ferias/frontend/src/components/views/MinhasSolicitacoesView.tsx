/**
 * MinhasSolicitacoesView.tsx
 * Página que mostra histórico de solicitações do usuário
 * Exibe status, datas, observações e permite consultar detalhes
 */

import { useEffect, useState } from 'react'
import { useApi, useCurrentUser } from 'bpms-frontend-master'
import type { VacationRequest } from '../../types'

export default function MinhasSolicitacoesView() {
  const [requests, setRequests] = useState<VacationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { get } = useApi()
  const user = useCurrentUser()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const response = await get(`/api/ferias/solicitacoes/${user?.id || 'me'}`)
        const data = response.data || []
        setRequests(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações')
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchRequests()
    }
  }, [get, user?.id])

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      solicitado: '#0d6efd',
      'pendente-gestor': '#ffc107',
      'pendente-rh': '#ff9800',
      aprovado: '#28a745',
      rejeitado: '#dc3545',
      cancelado: '#6c757d',
    }
    return statusMap[status] || '#666'
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const calculateDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Carregando minhas solicitações...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Erro ao carregar solicitações:</strong>
          <div className="error-details">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Minhas Solicitações de Férias</h1>
        <p>Você tem {filteredRequests.length} solicitação(ões)</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({requests.length})
        </button>
        <button
          className={`filter-button ${filter === 'pendente' ? 'active' : ''}`}
          onClick={() => setFilter('pendente')}
        >
          Pendentes ({requests.filter((r) => r.status === 'pendente').length})
        </button>
        <button
          className={`filter-button ${filter === 'aprovado' ? 'active' : ''}`}
          onClick={() => setFilter('aprovado')}
        >
          Aprovadas ({requests.filter((r) => r.status === 'aprovado').length})
        </button>
        <button
          className={`filter-button ${filter === 'rejeitado' ? 'active' : ''}`}
          onClick={() => setFilter('rejeitado')}
        >
          Rejeitadas ({requests.filter((r) => r.status === 'rejeitado').length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Dias</th>
                <th>Status</th>
                <th>Data Solicitação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    {formatDate(request.dataInicio)} a{' '}
                    {formatDate(request.dataFim)}
                  </td>
                  <td>{calculateDays(request.dataInicio, request.dataFim)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(request.status),
                        color: 'white',
                      }}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>{formatDate(request.dataSolicitacao)}</td>
                  <td>
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedId(
                          expandedId === request.id ? null : request.id
                        )
                      }}
                    >
                      {expandedId === request.id ? '▼' : '▶'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expandedId && (
        <div className="form-section" style={{ marginTop: '20px' }}>
          {(() => {
            const request = filteredRequests.find((r) => r.id === expandedId)
            return request ? (
              <>
                <h3>Detalhes da Solicitação #{request.id}</h3>
                <div className="form-group">
                  <label className="form-label">Motivo</label>
                  <p>{request.motivo || '-'}</p>
                </div>
                {request.observacoes && (
                  <div className="form-group">
                    <label className="form-label">Observações</label>
                    <p>{request.observacoes}</p>
                  </div>
                )}
                {request.motivoRejeicao && (
                  <div className="form-group">
                    <label className="form-label">Motivo da Rejeição</label>
                    <p className="error-text">{request.motivoRejeicao}</p>
                  </div>
                )}
                {request.dataAprovacao && (
                  <div className="form-group">
                    <label className="form-label">Data de Aprovação</label>
                    <p>{formatDate(request.dataAprovacao)}</p>
                  </div>
                )}
              </>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}
