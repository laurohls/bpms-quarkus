/**
 * SHARED: Task Card
 * Responsabilidade: Exibir um card de uma tarefa/solicitação
 * Usado por: TaskListView, MinhasSolicitacoesView
 */

import type { Task } from '../../types'
import type { TaskSummary } from 'bpms-frontend-master'
import { formatDate } from '../../utils/dateHelpers'

interface TaskCardProps {
  task: Task | TaskSummary
  onClick?: () => void
  actions?: React.ReactNode
}

export default function TaskCard({ task, onClick, actions }: TaskCardProps) {
  const status = task.taskDefinitionKey?.replace(/([A-Z])/g, ' $1').toLowerCase().trim() || 'Pendente'

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <div className="task-info">
          <h3>{task.name}</h3>
          <span className="task-assignee">{task.assignee || task.owner || 'Não atribuído'}</span>
        </div>
        <div className="task-status">
          <span className="status-badge">{status}</span>
        </div>
      </div>

      {task.description && (
        <div className="task-description">
          {task.description}
        </div>
      )}

      <div className="task-meta">
        <span className="task-date">Criado: {formatDate(task.createTime || task.createdAt)}</span>
        {task.priority && (
          <span className={`task-priority priority-${task.priority}`}>
            Prioridade: {task.priority}
          </span>
        )}
      </div>

      {actions && (
        <div className="task-actions">
          {actions}
        </div>
      )}
    </div>
  )
}
