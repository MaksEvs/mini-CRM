import type { Profile, Task, TaskStatus } from '../../../shared/api/database.types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  in_review: 'На проверке',
  accepted: 'Принята',
  rework: 'На доработке',
}

export interface TaskStatusAction {
  status: TaskStatus
  label: string
  requiresComment: boolean
}

export function getAvailableTaskActions(task: Task, profile: Profile): TaskStatusAction[] {
  if (profile.role === 'executor' && task.assignee_id === profile.id) {
    if (task.status === 'new' || task.status === 'rework') {
      return [
        {
          status: 'in_progress',
          label: 'Начать работу',
          requiresComment: false,
        },
      ]
    }
    if (task.status === 'in_progress') {
      return [
        {
          status: 'in_review',
          label: 'Отправить на проверку',
          requiresComment: false,
        },
      ]
    }
  }

  if (profile.role === 'manager' && task.status === 'in_review') {
    return [
      { status: 'accepted', label: 'Принять задачу', requiresComment: false },
      {
        status: 'rework',
        label: 'Вернуть на доработку',
        requiresComment: true,
      },
    ]
  }

  return []
}
