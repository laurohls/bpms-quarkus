/**
 * AnalisarSolicitacaoForm.tsx
 * RH analisa solicitacao - usa lib compartilhada taskService (motor /task/{id}/complete)
 */

import { useState } from 'react'
import { taskService } from 'bpms-frontend-master'
import type { RhAnalysisData } from '../../types'

interface AnalisarSolicitacaoFormProps {
  taskId: string
  solicitacaoId: string
  onSuccess?: () => void
}

export default function AnalisarSolicitacaoForm({
  taskId,
  onSuccess,
}: AnalisarSolicitacaoFormProps) {
  const [formData, setFormData] = useState<RhAnalysisData>({
    parecer: 'pendente',
    saldoDisponivelAnual: 0,
    diasSolicitados: 0,
    diasAposPeriodo: 0,
    observacoes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.parecer || formData.parecer === 'pendente') {
      newErrors.parecer = 'Parecer é obrigatório'
    }
    if (formData.saldoDisponivelAnual < 0) {
      newErrors.saldoDisponivelAnual = 'Saldo não pode ser negativo'
    }
    if (formData.parecer === 'rejeitado' && !formData.observacoes.trim()) {
      newErrors.observacoes = 'Observações são obrigatórias para rejeição'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      // Mapeia parecer da UI para enum do BPMN (RHReviewTask formData)
      const rhDecisionMap: Record<string, string> = {
        aprovado: 'APPROVED',
        rejeitado: 'REJECTED',
        condicional: 'ADJUSTMENT_REQUIRED',
      }
      await taskService.complete(taskId, {
        rhDecision: rhDecisionMap[formData.parecer] ?? formData.parecer,
        rhResponse: formData.observacoes,
        saldoDisponivelAnual: formData.saldoDisponivelAnual,
        diasSolicitados: formData.diasSolicitados,
      })
      setSuccess(true)
      setTimeout(() => onSuccess?.(), 1200)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erro ao submeter análise',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <strong>✓ Análise enviada com sucesso!</strong>
        <p>A solicitação foi {formData.parecer === 'aprovado' ? 'aprovada' : 'rejeitada'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="solicitacao-form">
      {errors.submit && (
        <div className="error-message">
          <strong>Erro:</strong> {errors.submit}
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title">Análise RH (lib: taskService.complete)</h3>

        <div className="form-group">
          <label className="form-label required">Parecer</label>
          <select
            className="form-select"
            value={formData.parecer}
            onChange={(e) => setFormData({ ...formData, parecer: e.target.value as RhAnalysisData['parecer'] })}
          >
            <option value="pendente">-- Selecione --</option>
            <option value="aprovado">Aprovar (APPROVED)</option>
            <option value="rejeitado">Rejeitar (REJECTED)</option>
            <option value="condicional">Aprovar com Condições (ADJUSTMENT_REQUIRED)</option>
          </select>
          {errors.parecer && <div className="form-error">{errors.parecer}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Saldo Disponível (dias)</label>
          <input
            type="number"
            className="form-input"
            value={formData.saldoDisponivelAnual}
            onChange={(e) =>
              setFormData({ ...formData, saldoDisponivelAnual: parseFloat(e.target.value) || 0 })
            }
            placeholder="Ex: 15"
          />
          {errors.saldoDisponivelAnual && <div className="form-error">{errors.saldoDisponivelAnual}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Observações {formData.parecer === 'rejeitado' && <span className="required-mark">(obrigatório)</span>}</label>
          <textarea
            className="form-textarea"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Parecer será enviado como rhResponse para motor /task/{id}/complete"
            rows={5}
          />
          {errors.observacoes && <div className="form-error">{errors.observacoes}</div>}
        </div>
      </div>

      <div className="form-button-group">
        <button type="button" className="form-button secondary" onClick={() => window.history.back()}>
          Cancelar
        </button>
        <button type="submit" className="form-button primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Análise'}
        </button>
      </div>
    </form>
  )
}
