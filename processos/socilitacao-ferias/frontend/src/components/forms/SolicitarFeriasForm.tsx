/**
 * FORM: Solicitar Férias
 * Responsabilidade: Servidor solicita novas férias
 * Usado por: SolicitarFeriasView
 */

import { useState } from 'react'
import axios from 'axios'
import type { VacationFormData } from '../../types'
import { daysBetween } from '../../utils/dateHelpers'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:81' })

export default function SolicitarFeriasForm() {
  const [formData, setFormData] = useState<VacationFormData>({
    employeeName: '',
    email: '',
    startDate: '',
    endDate: '',
    reason: '',
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
    if (!formData.endDate) {
      setError('Informe a data de término.')
      return false
    }
    if (formData.endDate < formData.startDate) {
      setError('A data final deve ser igual ou posterior à data de início.')
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
      const variables = {
        ...formData,
        days: dias,
        nome: formData.employeeName,
        dataInicio: formData.startDate,
        dataFim: formData.endDate,
        motivo: formData.reason,
        dias,
      }
      const response = await api.post('/process', { variables })
      setFormData({
        employeeName: '',
        email: '',
        startDate: '',
        endDate: '',
        reason: '',
      })
      setSuccess(true)
      // Window location change to redirect after success
      setTimeout(() => {
        window.location.href = '/solicitacao-ferias/minha-fila'
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
        <label htmlFor="employeeName">Nome Completo *</label>
        <input
          id="employeeName"
          type="text"
          value={formData.employeeName}
          onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
          placeholder="Ex: João Silva"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="seu.email@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Data de Início *</label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Data de Término *</label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {dias > 0 && (
          <div className="form-group">
            <label>Total de Dias</label>
            <div className="dias-badge">{dias} dias</div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reason">Motivo da Solicitação *</label>
        <textarea
          id="reason"
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
