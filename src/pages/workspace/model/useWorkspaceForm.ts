import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ConstructionObject, Task } from '../../../shared/api/database.types'
import { changeTaskStatus } from '../../../features/change-task-status'
import { manageObject } from '../../../features/manage-object'
import { saveTask } from '../../../features/manage-task'
import { getErrorMessage } from '../../../shared/lib/errors'
import { EMPTY_FORM } from './workspaceTypes'
import type { WorkspaceDialogKind, WorkspaceFormValues } from './workspaceTypes'

export function useWorkspaceForm(
  setNotice: (notice: string) => void,
  refreshData: () => Promise<void>,
  setBusy: (busy: boolean) => void,
) {
  const [dialog, setDialog] = useState<WorkspaceDialogKind>(null)
  const [form, setForm] = useState<WorkspaceFormValues>(EMPTY_FORM)
  const [selectedObject, setSelectedObject] = useState<ConstructionObject | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  function openObjectForm(object?: ConstructionObject): void {
    setSelectedObject(object ?? null)
    setForm({ ...EMPTY_FORM, name: object?.name ?? '', address: object?.address ?? '' })
    setDialog(object ? 'edit-object' : 'object')
  }

  function openTaskForm(task?: Task, defaultObjectId?: string): void {
    setSelectedTask(task ?? null)
    setForm({
      ...EMPTY_FORM,
      title: task?.title ?? '',
      description: task?.description ?? '',
      assigneeId: task?.assignee_id ?? '',
      objectId: task?.object_id ?? defaultObjectId ?? '',
    })
    setDialog(task ? 'edit-task' : 'task')
  }

  function closeDialog(): void {
    setDialog(null)
    setForm(EMPTY_FORM)
  }

  function updateFormField(field: keyof WorkspaceFormValues, value: string): void {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitForm(event: FormEvent<HTMLFormElement>, busy: boolean): Promise<void> {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      if (dialog === 'object' || dialog === 'edit-object') {
        await manageObject({ name: form.name, address: form.address }, selectedObject?.id)
      } else if (dialog === 'task' || dialog === 'edit-task') {
        await saveTask(
          {
            title: form.title,
            description: form.description,
            object_id: form.objectId,
            assignee_id: form.assigneeId,
          },
          selectedTask?.id,
        )
      } else if (dialog === 'rework' && selectedTask) {
        await changeTaskStatus(selectedTask.id, 'rework', form.comment)
      }
      setNotice('Изменения сохранены')
      closeDialog()
      await refreshData()
    } catch (error) {
      setNotice(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  function openReworkDialog(task: Task): void {
    setSelectedTask(task)
    setForm({ ...EMPTY_FORM, comment: '' })
    setDialog('rework')
  }

  return {
    dialog,
    form,
    selectedTask,
    openObjectForm,
    openTaskForm,
    closeDialog,
    updateFormField,
    submitForm,
    openReworkDialog,
  }
}
