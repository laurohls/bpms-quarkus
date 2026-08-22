/**
 * Types específicos do processo de Férias
 */

export type VacationFormData = {
  employeeName: string
  email: string
  startDate: string
  endDate: string
  reason: string
  departamento?: string
  cargo?: string
}

export type VacationRequest = {
  id: string
  usuarioId: string
  dataInicio: string
  dataFim: string
  motivo: string
  status: 'solicitado' | 'pendente-gestor' | 'pendente-rh' | 'aprovado' | 'rejeitado' | 'cancelado'
  dataSolicitacao: string
  dataAprovacao?: string
  dataRejeicao?: string
  observacoes?: string
  motivoRejeicao?: string
  processInstanceId?: string
}

export type Task = {
  id: string
  name: string
  assignee?: string
  owner?: string
  description?: string
  processInstanceId: string
  taskDefinitionKey?: string
  priority?: number
  createTime?: string
  createdAt?: string
  processDefinitionName?: string
  dueDate?: string
  data?: Record<string, unknown>
}

export type TaskDetails = Task & {
  processInstance?: {
    id: string
    processDefinitionKey?: string
    businessKey?: string
    suspended: boolean
  }
  processVariables?: Record<string, unknown>
  taskVariables?: Record<string, unknown>
  data?: Record<string, unknown>
}

export type ProcessDefinition = {
  id: string
  key: string
  name?: string
  version: number
  deploymentId?: string
}

export type Activity = {
  id: string
  activityId?: string
  activityName?: string
  activityType?: string
  startTime?: string
  endTime?: string
}

export type User = {
  id: string
  name: string
  role: string
  initials: string
  email?: string
  departamento?: string
}

export type RhAnalysisData = {
  parecer: 'pendente' | 'aprovado' | 'rejeitado' | 'condicional'
  saldoDisponivelAnual: number
  diasSolicitados: number
  diasAposPeriodo: number
  observacoes: string
  analisadoPor?: string
  dataAnalise?: string
}

export type GestorValidationData = {
  viabilidade: 'pendente' | 'viavel' | 'condicional' | 'nao-viavel'
  impactoOperacional: 'baixo' | 'medio' | 'alto' | 'critico'
  equipeDisponivel: boolean
  substituicaoIdentificada: boolean
  observacoes: string
  validadoPor?: string
  dataValidacao?: string
}

export type CancelVacationData = {
  motivo: string
  justificativa: string
  dataCancelamento: string
  canceladoPor?: string
}
