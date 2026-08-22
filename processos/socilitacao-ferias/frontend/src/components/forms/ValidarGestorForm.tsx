/**
 * ValidarGestorForm.tsx
 * Formulário para gestor validar viabilidade operacional da solicitação de férias
 * Analisa impacto na equipe e operações
 */

import { useState } from 'react'
import { taskService } from 'bpms-frontend-master'
import type { GestorValidationData } from '../../types'

interface ValidarGestorFormProps {
  taskId: string
  solicitacaoId: string
  onSuccess?: () => void
}

export default function ValidarGestorForm({
  taskId,
  solicitacaoId,
  onSuccess,
}: ValidarGestorFormProps) {
  const [formData, setFormData] = useState<GestorValidationData>({
    viabilidade: 'pendente',
    impactoOperacional: 'baixo',
    equipeDisponivel: true,
    substituicaoIdentificada: false,
    observacoes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.viabilidade || formData.viabilidade === 'pendente') {
      newErrors.viabilidade = 'Viabilidade é obrigatória'
    }

    if (!formData.impactoOperacional) {
      newErrors.impactoOperacional = 'Impacto operacional é obrigatório'
    }

    if (
      formData.viabilidade === 'nao-viavel' &&
      !formData.observacoes.trim()
    ) {
      newErrors.observacoes = 'Observações são obrigatórias para não viável'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      // BPMN: parecerGestor Aprovado/Reprovado + motivoRecusa (obrigatorio se Reprovado)
      const parecerGestor = formData.viabilidade === 'nao-viavel' ? 'Reprovado' : 'Aprovado'
      await taskService.complete(taskId, {
        parecerGestor,
        motivoRecusa: formData.observacoes,
        gestorViabilidade: formData.viabilidade,
        gestorImpacto: formData.impactoOperacional,
        gestorEquipeDisponivel: formData.equipeDisponivel,
        gestorSubstituicao: formData.substituicaoIdentificada,
        gestorObservacoes: formData.observacoes,
        solicitacaoId,
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erro ao submeter validação',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <strong>✓ Validação enviada com sucesso!</strong>
        <p>
          A solicitação foi marcada como{' '}
          {formData.viabilidade === 'viavel'
            ? 'viável'
            : formData.viabilidade === 'condicional'
              ? 'viável com condições'
              : 'não viável'}
        </p>
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
        <h3 className="form-section-title">Validação do Gestor</h3>

        <div className="form-group">
          <label className="form-label required">Viabilidade Operacional</label>
          <select
            className="form-select"
            value={formData.viabilidade}
            onChange={(e) =>
              setFormData({ ...formData, viabilidade: e.target.value })
            }
          >
            <option value="pendente">-- Selecione --</option>
            <option value="viavel">Viável</option>
            <option value="condicional">Viável com Condições</option>
            <option value="nao-viavel">Não Viável</option>
          </select>
          {errors.viabilidade && (
            <div className="form-error">{errors.viabilidade}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label required">Impacto Operacional</label>
          <select
            className="form-select"
            value={formData.impactoOperacional}
            onChange={(e) =>
              setFormData({ ...formData, impactoOperacional: e.target.value })
            }
          >
            <option value="baixo">Baixo (sem afetar operações)</option>
            <option value="medio">Médio (impacto controlável)</option>
            <option value="alto">Alto (requer planejamento extra)</option>
            <option value="critico">Crítico (operações afetadas)</option>
          </select>
          {errors.impactoOperacional && (
            <div className="form-error">
              {errors.impactoOperacional}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.equipeDisponivel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  equipeDisponivel: e.target.checked,
                })
              }
            />
            <span style={{ marginLeft: '8px' }}>
              Equipe disponível para cobrir período
            </span>
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.substituicaoIdentificada}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  substituicaoIdentificada: e.target.checked,
                })
              }
            />
            <span style={{ marginLeft: '8px' }}>
              Substituição identificada e treinada
            </span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">
            Observações
            {formData.viabilidade === 'nao-viavel' && (
              <span className="required-mark"> (obrigatório em caso de não viável)</span>
            )}
          </label>
          <textarea
            className="form-textarea"
            value={formData.observacoes}
            onChange={(e) =>
              setFormData({ ...formData, observacoes: e.target.value })
            }
            placeholder="Descreva o impacto operacional, motivos de não viabilidade ou condições necessárias..."
            rows={5}
          />
          {errors.observacoes && (
            <div className="form-error">{errors.observacoes}</div>
          )}
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
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Validação'}
        </button>
      </div>
    </form>
  )
}
