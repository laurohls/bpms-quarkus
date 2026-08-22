/**
 * FORM: Solicitar Férias
 * Responsabilidade: Servidor solicita novas férias
 * Usado por: SolicitarFeriasView
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VacationFormData } from '../../types'
import { daysBetween } from '../../utils/dateHelpers'
import { processService } from 'bpms-frontend-master'

export default function SolicitarFeriasForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<VacationFormData>({
    employeeName: '',
    email: '',
    startDate: '',
    endDate: '',
    reason: '',
    abonoPecuniario: false,
    adiantamento13: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    if (!formData.employeeName.trim() || formData.employeeName.trim().length < 3) {
      setError('Informe o nome completo (mín. 3 caracteres).')
      return false
    }
    if (!formData.email.trim()) {
      setError('Informe o email.')
      return false
    }
    if (!formData.startDate) {
      setError('Informe a data de início.')
      return false
    }
    // Regra: bloquear retroativos e antecedencia minima 30 dias
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const inicio = new Date(formData.startDate)
    if (inicio < hoje) {
      setError('Data de início não pode ser retroativa.')
      return false
    }
    const diffAntecedencia = Math.ceil((inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    if (diffAntecedencia < 30) {
      setError(`Antecedência mínima de 30 dias. Faltam ${30 - diffAntecedencia} dias (início em ${formData.startDate}).`)
      return false
    }
    if (!formData.endDate) {
      setError('Informe a data de término.')
      return false
    }
    if (formData.endDate < formData.startDate) {
      setError('A data final deve ser igual ou posterior à data de início.')
      return false
    }
    const dias = daysBetween(formData.startDate, formData.endDate)
    // Regra: abono Sim -> limitar a 20 dias (10 abono + 20 ferias)
    const maxDias = formData.abonoPecuniario ? 20 : 30
    if (dias < 10) {
      setError(`Quantidade mínima é 10 dias (informado ${dias}).`)
      return false
    }
    if (dias > maxDias) {
      setError(
        formData.abonoPecuniario
          ? `Com abono pecuniário, máximo é 20 dias (10 de abono). Informado ${dias}.`
          : `Quantidade máxima é 30 dias (informado ${dias}).`,
      )
      return false
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 10) {
      setError('Descreva o motivo com pelo menos 10 caracteres.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) return

    setLoading(true)
    try {
      const dias = daysBetween(formData.startDate, formData.endDate)
      // Abono: se Sim, fixa 10 dias abono e limita ferias a 20 (ja validado)
      const quantidadeDias = formData.abonoPecuniario ? Math.min(dias, 20) : dias
      const variables = {
        ...formData,
        days: quantidadeDias,
        quantidadeDias,
        dataInicio: formData.startDate,
        dataFim: formData.endDate,
        motivo: formData.reason,
        dias: quantidadeDias,
        diasAbono: formData.abonoPecuniario ? 10 : 0,
        abonoPecuniario: !!formData.abonoPecuniario,
        adiantamento13: !!formData.adiantamento13,
        nome: formData.employeeName,
        // Variaveis para gateways CIB7
        saldoDisponivel: true, // sera recalculado no VerificarSaldoDelegate
        antecedenciaMinima: true,
      }
      await processService.createProcess(variables as Record<string, unknown>)
      setFormData({
        employeeName: '',
        email: '',
        startDate: '',
        endDate: '',
        reason: '',
        abonoPecuniario: false,
        adiantamento13: false,
      })
      setSuccess(true)
      // Navigate after success using React Router
      setTimeout(() => {
        navigate('/atividades')
      }, 2000)
    } catch (err) {
      setError('Não foi possível criar a solicitação de férias. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const dias = formData.startDate && formData.endDate ? daysBetween(formData.startDate, formData.endDate) : 0

  return (
    <form onSubmit={handleSubmit} className="solicitar-ferias-form">
      {success && (
        <div className="alert alert-success">
          ✓ Solicitação criada com sucesso! Redirecionando...
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ✗ {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="employeeName" className="form-label">Nome Completo *</label>
        <input
          id="employeeName"
          type="text"
          className="form-input"
          value={formData.employeeName}
          onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
          placeholder="Ex: João Silva"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email *</label>
        <input
          id="email"
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="seu.email@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">Data de Início *</label>
          <input
            id="startDate"
            type="date"
            className="form-input"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate" className="form-label">Data de Término *</label>
          <input
            id="endDate"
            type="date"
            className="form-input"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {dias > 0 && (
          <div className="form-group">
            <label className="form-label">Total de Dias</label>
            <div className="dias-badge">
              {formData.abonoPecuniario ? Math.min(dias, 20) : dias} dias {formData.abonoPecuniario && dias > 20 && '(limitado a 20 + 10 abono)'}
            </div>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Abono Pecuniário (Vender 1/3) *</label>
          <select
            className="form-input"
            value={formData.abonoPecuniario ? 'sim' : 'nao'}
            onChange={(e) => setFormData({ ...formData, abonoPecuniario: e.target.value === 'sim' })}
            disabled={loading}
          >
            <option value="nao">Não</option>
            <option value="sim">Sim (limita a 20 dias + 10 abono)</option>
          </select>
          <small className="form-hint">Se Sim, suas férias serão no máximo 20 dias.</small>
        </div>
        <div className="form-group">
          <label className="form-label">Adiantamento 13º Salário</label>
          <select
            className="form-input"
            value={formData.adiantamento13 ? 'sim' : 'nao'}
            onChange={(e) => setFormData({ ...formData, adiantamento13: e.target.value === 'sim' })}
            disabled={loading}
          >
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reason" className="form-label">Motivo da Solicitação *</label>
        <textarea
          id="reason"
          className="form-textarea"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Descreva o motivo da sua solicitação de férias (mín. 10 caracteres)..."
          required
          disabled={loading}
          rows={4}
        />
        <small className="form-hint">{formData.reason.length} caracteres</small>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Solicitar Férias'}
        </button>
      </div>
    </form>
  )
}
