/**
 * ConsultarRespostaForm.tsx
 * Formulário para o funcionário consultar a resposta de sua solicitação de férias
 * Exibe a decisão do RH, parecer e próximas ações
 */

import { useState, useEffect } from 'react'
import { useApi } from 'bpms-frontend-master'
import type { EmployeeResponseData } from '../../types'

interface ConsultarRespostaFormProps {
  taskId: string
  solicitacaoId: string
  onSuccess?: () => void
}

export default function ConsultarRespostaForm({
  taskId,
  solicitacaoId,
  onSuccess,
}: ConsultarRespostaFormProps) {
  const [responseData, setResponseData] = useState<EmployeeResponseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { get, post } = useApi()

  // Carregar dados da resposta do RH
  useEffect(() => {
    const fetchResponseData = async () => {
      try {
        setLoading(true)
        const data = await get(`/api/ferias/tasks/${taskId}/resposta`)
        setResponseData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar resposta')
      } finally {
        setLoading(false)
      }
    }

    fetchResponseData()
  }, [taskId, get])

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasAcknowledged) {
      setError('Você deve confirmar que tomou ciência da resposta')
      return
    }

    try {
      setSubmitting(true)
      await post(`/api/ferias/tasks/${taskId}/acknowledge`, {
        taskId,
        solicitacaoId,
        acknowledgedAt: new Date().toISOString(),
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar recebimento')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-spinner" />
        <p className="loading-text">Carregando sua resposta...</p>
      </div>
    )
  }

  if (error && !responseData) {
    return (
      <div className="form-container">
        <div className="error-message">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    )
  }

  if (!responseData) {
    return (
      <div className="form-container">
        <div className="info-message">
          <strong>ℹ️ Nenhuma resposta disponível</strong>
          <p>Sua solicitação ainda está em análise. Volte mais tarde para verificar.</p>
        </div>
      </div>
    )
  }

  const statusBgColor = {
    aprovado: '#d4edda',
    rejeitado: '#f8d7da',
    condicional: '#fff3cd',
  }[responseData.parecer] || '#e7e7e7'

  const statusTextColor = {
    aprovado: '#155724',
    rejeitado: '#721c24',
    condicional: '#856404',
  }[responseData.parecer] || '#333'

  return (
    <form onSubmit={handleAcknowledge} className="solicitacao-form">
      {/* Status da Solicitação */}
      <div className="form-section" style={{ borderLeft: `4px solid ${statusTextColor}` }}>
        <h3 className="form-section-title">Status da Solicitação</h3>

        <div
          className="status-card"
          style={{
            backgroundColor: statusBgColor,
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <div style={{ color: statusTextColor, fontSize: '18px', fontWeight: 'bold' }}>
            {responseData.parecer === 'aprovado' && '✓ Solicitação Aprovada'}
            {responseData.parecer === 'rejeitado' && '✗ Solicitação Rejeitada'}
            {responseData.parecer === 'condicional' && '⚠ Aprovada com Condições'}
          </div>
          <div style={{ color: statusTextColor, fontSize: '14px', marginTop: '8px' }}>
            Respondido em: {new Date(responseData.respondidoEm).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Análise RH */}
      <div className="form-section">
        <h3 className="form-section-title">Análise do RH</h3>

        <div className="form-group">
          <label className="form-label">Parecer</label>
          <div className="form-static">
            {responseData.parecer === 'aprovado' && 'Aprovado'}
            {responseData.parecer === 'rejeitado' && 'Rejeitado'}
            {responseData.parecer === 'condicional' && 'Aprovado com Condições'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Saldo Disponível (dias)</label>
          <div className="form-static">{responseData.saldoDisponivel} dias</div>
        </div>

        <div className="form-group">
          <label className="form-label">Dias Solicitados</label>
          <div className="form-static">{responseData.diasSolicitados} dias</div>
        </div>

        <div className="form-group">
          <label className="form-label">Dias Restantes após Período</label>
          <div className="form-static">
            {responseData.saldoDisponivel - responseData.diasSolicitados} dias
          </div>
        </div>

        {responseData.observacoes && (
          <div className="form-group">
            <label className="form-label">Parecer do RH</label>
            <div className="form-static-textarea">{responseData.observacoes}</div>
          </div>
        )}
      </div>

      {/* Próximas Ações */}
      {responseData.parecer === 'aprovado' && (
        <div className="form-section" style={{ backgroundColor: '#d4edda', borderRadius: '8px', padding: '15px' }}>
          <h3 className="form-section-title">Próximas Ações</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Suas férias foram aprovadas</li>
            <li>Você receberá confirmação por email com as datas aprovadas</li>
            <li>Coordene o período de afastamento com seu gestor</li>
            <li>Não esqueça de fazer a solicitação de ausência no sistema</li>
          </ul>
        </div>
      )}

      {responseData.parecer === 'rejeitado' && (
        <div className="form-section" style={{ backgroundColor: '#f8d7da', borderRadius: '8px', padding: '15px' }}>
          <h3 className="form-section-title">Próximas Ações</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Sua solicitação foi rejeitada</li>
            <li>Verifique o parecer do RH acima para entender o motivo</li>
            <li>Entre em contato com o RH para esclarecer dúvidas</li>
            <li>Você pode fazer uma nova solicitação quando desejar</li>
          </ul>
        </div>
      )}

      {responseData.parecer === 'condicional' && (
        <div className="form-section" style={{ backgroundColor: '#fff3cd', borderRadius: '8px', padding: '15px' }}>
          <h3 className="form-section-title">Próximas Ações</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Sua solicitação foi aprovada com condições</li>
            <li>Revise as condições indicadas no parecer do RH</li>
            <li>Você deve confirmar aceitar as condições propostas</li>
            <li>Após confirmação, suas férias serão agendadas</li>
          </ul>
        </div>
      )}

      {/* Confirmação de Recebimento */}
      <div className="form-section">
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
            />
            <span>Declaro que li e entendi a resposta do RH sobre minha solicitação de férias</span>
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>

      {/* Botões de Ação */}
      <div className="form-button-group">
        <button
          type="button"
          className="form-button secondary"
          onClick={() => window.history.back()}
        >
          Voltar
        </button>
        <button
          type="submit"
          className="form-button primary"
          disabled={submitting || !hasAcknowledged}
        >
          {submitting ? 'Confirmando...' : 'Confirmar Recebimento'}
        </button>
      </div>
    </form>
  )
}
