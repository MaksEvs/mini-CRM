import type { FormEvent } from 'react'
import type {
  ConstructionObject,
  Profile,
  Task,
  TaskStatus,
} from '../../../shared/api/database.types'

export type WorkspaceDialogKind = 'object' | 'task' | 'edit-object' | 'edit-task' | 'rework' | null

export interface WorkspaceFormValues {
  name: string
  address: string
  title: string
  description: string
  assigneeId: string
  objectId: string
  comment: string
}

export interface WorkspaceController {
  objects: ConstructionObject[]
  tasks: Task[]
  executors: Profile[]
  busy: boolean
  notice: string
  dialog: WorkspaceDialogKind
  form: WorkspaceFormValues
  selectedTask: Task | null
  filter: TaskStatus | 'all'
  setNotice: (notice: string) => void
  setFilter: (filter: TaskStatus | 'all') => void
  openObjectForm: (object?: ConstructionObject) => void
  openTaskForm: (task?: Task, defaultObjectId?: string) => void
  closeDialog: () => void
  updateFormField: (field: keyof WorkspaceFormValues, value: string) => void
  submitForm: (event: FormEvent<HTMLFormElement>) => Promise<void>
  transitionTask: (task: Task, status: TaskStatus) => Promise<void>
  deleteObject: (object: ConstructionObject) => Promise<void>
  deleteTask: (task: Task, currentPath: string) => Promise<boolean>
}

export const EMPTY_FORM: WorkspaceFormValues = {
  name: '',
  address: '',
  title: '',
  description: '',
  assigneeId: '',
  objectId: '',
  comment: '',
}
