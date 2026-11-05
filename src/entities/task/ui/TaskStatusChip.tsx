import { Chip } from '@mui/material'
import type { TaskStatus } from '../../../shared/api/database.types'
import { TASK_STATUS_LABELS } from '../model/status'
import styles from './TaskStatusChip.module.css'

export function TaskStatusChip({
  status,
  size = 'small',
}: {
  status: TaskStatus
  size?: 'small' | 'medium'
}) {
  return (
    <Chip
      size={size}
      label={TASK_STATUS_LABELS[status]}
      className={`${styles.status} ${styles[statusClassNames[status]]}`}
    />
  )
}

const statusClassNames = {
  new: 'new',
  in_progress: 'inProgress',
  in_review: 'inReview',
  accepted: 'accepted',
  rework: 'rework',
} as const
