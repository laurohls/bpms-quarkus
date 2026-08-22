/**
 * PROCESS SERVICE - Comunica com motor/src/main/java/br/com/eyedata/bpms/web/ProcessResource.java
 * Endpoints: POST /process, GET /process/definitions, GET /process/definitions/{id}/diagram, GET /process/instances/{id}/history
 */

import { motorClient } from './motorClient'
import type {
  ProcessInstanceSummary,
  ProcessDefinitionSummary,
  ActivityHistorySummary,
} from '../types/bpms'

export const processService = {
  /**
   * POST /process { variables: {...} } -> 201 ProcessInstanceSummary
   * @example createProcess({ employeeName: 'Ana', email: 'ana@eyedata.com', startDate: '2026-09-01', endDate: '2026-09-05', reason: '...', days: 5 })
   */
  async createProcess(variables: Record<string, unknown>): Promise<ProcessInstanceSummary> {
    return motorClient.post<ProcessInstanceSummary>('/process', { variables })
  },

  /** GET /process/definitions -> List<ProcessDefinitionSummary> */
  async listDefinitions(): Promise<ProcessDefinitionSummary[]> {
    return motorClient.get<ProcessDefinitionSummary[]>('/process/definitions')
  },

  /**
   * GET /process/definitions/{id}/diagram -> XML string (ou null se 404)
   * Usado com bpmn-js NavigatedViewer
   */
  async getDiagram(processDefinitionId: string): Promise<string | null> {
    try {
      const xml = await motorClient.getText(
        `/process/definitions/${encodeURIComponent(processDefinitionId)}/diagram`,
      )
      return xml
    } catch (e: unknown) {
      if (axiosIs404(e)) return null
      throw e
    }
  },

  /** GET /process/instances/{processInstanceId}/history -> List<ActivityHistorySummary> */
  async getHistory(processInstanceId: string): Promise<ActivityHistorySummary[]> {
    return motorClient.get<ActivityHistorySummary[]>(
      `/process/instances/${encodeURIComponent(processInstanceId)}/history`,
    )
  },
}

function axiosIs404(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'response' in e &&
    typeof (e as { response?: { status?: number } }).response?.status === 'number' &&
    (e as { response: { status: number } }).response.status === 404
  )
}
