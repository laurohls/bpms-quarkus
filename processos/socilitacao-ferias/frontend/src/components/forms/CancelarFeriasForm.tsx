/**
 * CancelarFeriasForm.tsx
 * Formulário para funcionário cancelar férias já aprovadas
 * Requer justificativa e atualiza disponibilidade do saldo
 */

import { useState } from 'react'
import { useApi } from 'bpms-frontend-master'
import type { CancelVacationData } from '../../types'

interface CancelarFeriasFormProps {
  solicitacaoId: string
  diasSolicitados: number
  onSuccess?: () => void
}

export default function CancelarFeriasForm({
  solicitacaoId,
  diasSolicitados,
  onSuccess,
}: CancelarFeriasFormProps) {
  const [formData, setFormData] = useState<CancelVacationData>({
    motivo: '',
    justificativa: '',
    dataCancelamento: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { post } = useApi()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Motivo é obrigatório'
    }

    if (!formData.justificativa.trim()) {
      newErrors.justificativa = 'Justificativa é obrigatória'
    }

    if (formData.justificativa.trim().length < 20) {
      newErrors.justificativa =
        'Justificativa deve ter no mínimo 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      await post(`/api/ferias/solicitacoes/${solicitacaoId}/cancelar`, {
        solicitacaoId,
        cancelData: formData,
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erro ao cancelar férias',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <strong>✓ Férias canceladas com sucesso!</strong>
        <p>
          {diasSolicitados} dias foram reintegrados ao seu saldo de férias.
        </p>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="form-section">
        <h3 className="form-section-title">Confirmar Cancelamento</h3>

        <div className="confirmation-message">
          <p>
            Você está prestes a <strong>cancelar {diasSolicitados} dias de férias</strong>.
          </p>
          <p>
            Essa ação é <strong>irreversível</strong> e notificará seu gestor e RH.
          </p>
          <p>
            <strong>Motivo informado:</strong> {formData.motivo}
          </p>
        </div>

        <div className="form-button-group">
          <button
            type="button"
            className="form-button secondary"
            onClick={() => setShowConfirmation(false)}
          >
            Voltar
          </button>
          <button
            type="button"
            className="form-button primary"
            style={{ backgroundColor: '#dc3545' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      if (validate()) {
        setShowConfirmation(true)
      }
    }} className="solicitacao-form">
      {errors.submit && (
        <div className="error-message">
          <strong>Erro:</strong> {errors.submit}
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title">Cancelar Férias</h3>

        <div className="alert-info">
          <strong>⚠️ Atenção:</strong> Ao cancelar suas férias, os dias
          serão reintegrados ao seu saldo e você perderá a reserva de
          período. Seu gestor e RH serão notificados.
        </div>

        <div className="form-group">
          <label className="form-label">Dias de Férias</label>
          <input
            type="text"
            className="form-input"
            value={`${diasSolicitados} dias`}
            disabled
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Motivo do Cancelamento</label>
          <select
            className="form-select"
            value={formData.motivo}
            onChange={(e) =>
              setFormData({ ...formData, motivo: e.target.value })
            }
          >
            <option value="">-- Selecione um motivo --</option>
            <option value="necessidade-trabalho">Necessidade de trabalho</option>
            <option value="mudanca-datas">Mudança de datas desejadas</option>
            <option value="problema-pessoal">Problema pessoal/familiar</option>
            <option value="doenca">Doença/motivo médico</option>
            <option value="outro">Outro</option>
          </select>
          {errors.motivo && (
            <div className="form-error">{errors.motivo}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label required">
            Justificativa Detalhada (mínimo 20 caracteres)
          </label>
          <textarea
            className="form-textarea"
            value={formData.justificativa}
            onChange={(e) =>
              setFormData({ ...formData, justificativa: e.target.value })
            }
            placeholder="Descreva detalhadamente o motivo do cancelamento..."
            rows={6}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {formData.justificativa.length}/200 caracteres
          </div>
          {errors.justificativa && (
            <div className="form-error">{errors.justificativa}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Data do Cancelamento</label>
          <input
            type="date"
            className="form-input"
            value={formData.dataCancelamento}
            onChange={(e) =>
              setFormData({ ...formData, dataCancelamento: e.target.value })
            }
          />
        </div>
      </div>

      <div className="form-button-group">
        <button
          type="button"
          className="form-button secondary"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="form-button primary"
          style={{ backgroundColor: '#dc3545' }}
        >
          Proceder com Cancelamento
        </button>
      </div>

      <style>{`
        .alert-info {
          background-color: #cfe2ff;
          border: 1px solid #b6d4fe;
          border-radius: 4px;
          padding: 12px 16px;
          color: #084298;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .confirmation-message {
          background-color: #fff3cd;
          border: 1px solid #ffecb5;
          border-radius: 4px;
          padding: 16px;
          color: #664d03;
          margin-bottom: 20px;
        }

        .confirmation-message p {
          margin: 8px 0;
        }

        .confirmation-message p:first-child {
          margin-top: 0;
        }

        .confirmation-message p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </form>
  )
}
