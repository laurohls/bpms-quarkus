/**
 * TASK SERVICE - Comunica com motor/src/main/java/br/com/eyedata/bpms/web/TaskResource.java
 * Endpoints: GET /task, GET /task/process/{key}, GET /task/{id}, POST /task/{id}/claim|unclaim|complete
 */

import { motorClient } from './motorClient'
import type { TaskSummary, TaskDetails } from '../types/bpms'

export const taskService = {
  /** GET /task -> List<TaskSummary> (active, orderByCreateTime desc) */
  async listActiveTasks(): Promise<TaskSummary[]> {
    return motorClient.get<TaskSummary[]>('/task')
  },

  /** GET /task/process/{processDefinitionId} -> List<TaskSummary> filtrado por process */
  async listTasksByProcess(processDefinitionKey: string): Promise<TaskSummary[]> {
    return motorClient.get<TaskSummary[]>(
      `/task/process/${encodeURIComponent(processDefinitionKey)}`,
    )
  },

  /** GET /task/{taskId} -> TaskDetails | null (404) */
  async getTask(taskId: string): Promise<TaskDetails | null> {
    try {
      return await motorClient.get<TaskDetails>(`/task/${encodeURIComponent(taskId)}`)
    } catch (e: unknown) {
      if (axiosIs404(e)) return null
      throw e
    }
  },

  /** POST /task/{taskId}/claim { userId } -> TaskSummary */
  async claim(taskId: string, userId: string): Promise<TaskSummary> {
    return motorClient.post<TaskSummary>(`/task/${encodeURIComponent(taskId)}/claim`, {
      userId,
    })
  },

  /** POST /task/{taskId}/unclaim -> TaskSummary */
  async unclaim(taskId: string): Promise<TaskSummary> {
    return motorClient.post<TaskSummary>(`/task/${encodeURIComponent(taskId)}/unclaim`)
  },

  /** POST /task/{taskId}/complete { variables } -> 204 No Content */
  async complete(taskId: string, variables: Record<string, unknown> = {}): Promise<void> {
    await motorClient.post<void>(`/task/${encodeURIComponent(taskId)}/complete`, {
      variables,
    })
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
