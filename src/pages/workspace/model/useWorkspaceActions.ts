import type { ConstructionObject, Task, TaskStatus } from '../../../shared/api/database.types'
import { changeTaskStatus } from '../../../features/change-task-status'
import { removeObject } from '../../../features/manage-object'
import { removeTask } from '../../../features/manage-task'
import { getErrorMessage } from '../../../shared/lib/errors'

interface WorkspaceActionsOptions {
  busy: boolean
  setBusy: (busy: boolean) => void
  setNotice: (notice: string) => void
  refreshData: () => Promise<void>
  openReworkDialog: (task: Task) => void
}

export function useWorkspaceActions({
  busy,
  setBusy,
  setNotice,
  refreshData,
  openReworkDialog,
}: WorkspaceActionsOptions) {
  async function transitionTask(task: Task, status: TaskStatus): Promise<void> {
    if (busy) return
    if (status === 'rework') return openReworkDialog(task)
    setBusy(true)
    try {
      await changeTaskStatus(task.id, status)
      setNotice('Статус задачи обновлён')
      await refreshData()
    } catch (error) {
      setNotice(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function deleteObject(object: ConstructionObject): Promise<void> {
    if (busy || !window.confirm(`Удалить объект «${object.name}»?`)) return
    setBusy(true)
    try {
      await removeObject(object.id)
      setNotice('Объект удалён')
      await refreshData()
    } catch (error) {
      setNotice(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function deleteTask(task: Task, currentPath: string): Promise<boolean> {
    if (busy || !window.confirm(`Удалить задачу «${task.title}» вместе с историей?`)) return false
    setBusy(true)
    try {
      await removeTask(task.id)
      setNotice('Задача удалена')
      await refreshData()
      return currentPath === `/tasks/${task.id}`
    } catch (error) {
      setNotice(getErrorMessage(error))
      return false
    } finally {
      setBusy(false)
    }
  }

  return { transitionTask, deleteObject, deleteTask }
}
