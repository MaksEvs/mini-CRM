import { transitionTask } from '../../../entities/task/api/tasks'
import type { TaskStatus } from '../../../shared/api/database.types'

export async function changeTaskStatus(
  taskId: string,
  status: TaskStatus,
  comment: string | null = null,
): Promise<void> {
  if (status === 'rework' && !comment?.trim()) {
    throw new Error('Укажите комментарий для доработки.')
  }
  await transitionTask(taskId, status, comment?.trim() || null)
}
