import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import type { FormEvent } from 'react'
import type { ConstructionObject, Profile } from '../../shared/api/database.types'

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

interface WorkspaceDialogProps {
  kind: WorkspaceDialogKind
  busy: boolean
  values: WorkspaceFormValues
  objects: ConstructionObject[]
  executors: Profile[]
  onChange: (field: keyof WorkspaceFormValues, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const DIALOG_TITLES: Record<Exclude<WorkspaceDialogKind, null>, string> = {
  object: 'Новый объект',
  'edit-object': 'Изменить объект',
  task: 'Новая задача',
  'edit-task': 'Изменить задачу',
  rework: 'Возврат на доработку',
}

export function WorkspaceDialog({
  kind,
  busy,
  values,
  objects,
  executors,
  onChange,
  onClose,
  onSubmit,
}: WorkspaceDialogProps) {
  const showsObjectFields = kind === 'object' || kind === 'edit-object'
  const showsTaskFields = kind === 'task' || kind === 'edit-task'

  return (
    <Dialog open={Boolean(kind)} onClose={() => !busy && onClose()} fullWidth maxWidth="sm">
      <form onSubmit={onSubmit}>
        <DialogTitle>{kind ? DIALOG_TITLES[kind] : ''}</DialogTitle>

        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            {showsObjectFields && <ObjectFields values={values} onChange={onChange} />}

            {showsTaskFields && (
              <TaskFields
                values={values}
                objects={objects}
                executors={executors}
                onChange={onChange}
              />
            )}

            {kind === 'rework' && (
              <TextField
                label="Комментарий для исполнителя"
                required
                multiline
                minRows={3}
                value={values.comment}
                onChange={(event) => onChange('comment', event.target.value)}
                helperText="Комментарий обязателен и попадёт в историю задачи."
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

interface ObjectFieldsProps {
  values: WorkspaceFormValues
  onChange: WorkspaceDialogProps['onChange']
}

function ObjectFields({ values, onChange }: ObjectFieldsProps) {
  return (
    <>
      <TextField
        label="Название объекта"
        required
        value={values.name}
        onChange={(event) => onChange('name', event.target.value)}
      />
      <TextField
        label="Адрес"
        required
        value={values.address}
        onChange={(event) => onChange('address', event.target.value)}
      />
    </>
  )
}

interface TaskFieldsProps {
  values: WorkspaceFormValues
  objects: ConstructionObject[]
  executors: Profile[]
  onChange: WorkspaceDialogProps['onChange']
}

function TaskFields({ values, objects, executors, onChange }: TaskFieldsProps) {
  return (
    <>
      <TextField
        label="Название задачи"
        required
        value={values.title}
        onChange={(event) => onChange('title', event.target.value)}
      />
      <TextField
        label="Описание"
        required
        multiline
        minRows={3}
        value={values.description}
        onChange={(event) => onChange('description', event.target.value)}
      />

      <FormControl required>
        <InputLabel id="object-select-label">Объект</InputLabel>
        <Select
          labelId="object-select-label"
          label="Объект"
          value={values.objectId}
          onChange={(event) => onChange('objectId', event.target.value)}
        >
          {objects.map((object) => (
            <MenuItem key={object.id} value={object.id}>
              {object.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl required>
        <InputLabel id="assignee-select-label">Исполнитель</InputLabel>
        <Select
          labelId="assignee-select-label"
          label="Исполнитель"
          value={values.assigneeId}
          onChange={(event) => onChange('assigneeId', event.target.value)}
        >
          {executors.map((executor) => (
            <MenuItem key={executor.id} value={executor.id}>
              {executor.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}
