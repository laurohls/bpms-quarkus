/**
 * BPMS TYPES - DTOs espelhando motor/src/main/java/br/com/eyedata/bpms
 * Process e Task - para services que comunicam com motor (porta 81)
 */

// ============================================================
// PROCESS - espelha br.com.eyedata.bpms.process
// ============================================================

export type ProcessInstanceSummary = {
  id: string
  processKey: string
}

export type CreateProcessRequest = {
  variables: Record<string, unknown>
}

export type ProcessDefinitionSummary = {
  id: string
  key: string
  name: string | null
  version: number
  deploymentId: string
  resourceName: string
  tenantId: string | null
  suspended: boolean
}

export type ActivityHistorySummary = {
  id: string
  activityId: string
  activityName: string | null
  activityType: string
  processInstanceId: string
  processDefinitionId: string
  taskId: string | null
  assignee: string | null
  startTime: string // ISO Date
  endTime: string | null
  durationInMillis: number | null
}

// ============================================================
// TASK - espelha br.com.eyedata.bpms.task
// ============================================================

export type TaskSummary = {
  id: string
  name: string
  assignee: string | null
  owner: string | null
  description: string | null
  processInstanceId: string
  executionId: string
  processDefinitionId: string
  taskDefinitionKey: string
  priority: number
  createTime: string // ISO Date
  parentTaskId: string | null
  formKey: string | null
  tenantId: string | null
}

export type ProcessInstanceDetails = {
  id: string
  processDefinitionId: string
  processDefinitionKey: string
  businessKey: string | null
  rootProcessInstanceId: string
  caseInstanceId: string | null
  tenantId: string | null
  suspended: boolean
}

export type TaskDetails = {
  task: TaskSummary
  processInstance: ProcessInstanceDetails | null
  processVariables: Record<string, unknown>
  taskVariables: Record<string, unknown>
}

export type ClaimTaskRequest = {
  userId: string
}

export type CompleteTaskRequest = {
  variables: Record<string, unknown>
}
