import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { fetchTaskHistory } from '../api/taskHistory'
import type { TaskHistory as TaskHistoryEntry } from '../../../shared/api/database.types'
import { TASK_STATUS_LABELS } from '../model/status'
import styles from './TaskHistory.module.css'

export function TaskHistory({ taskId }: { taskId: string }) {
  const [entries, setEntries] = useState<TaskHistoryEntry[]>([])
  const [state, setState] = useState<{ loading: boolean; failed: boolean }>({
    loading: true,
    failed: false,
  })

  useEffect(() => {
    let active = true
    fetchTaskHistory(taskId)
      .then((data) => {
        if (active) {
          setEntries(data)
          setState({ loading: false, failed: false })
        }
      })
      .catch(() => {
        if (active) {
          setState({ loading: false, failed: true })
        }
      })
    return () => {
      active = false
    }
  }, [taskId])

  if (state.loading) {
    return <CircularProgress size={22} />
  }
  if (state.failed) {
    return <Alert severity="error">Не удалось загрузить историю.</Alert>
  }
  if (!entries.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        История пока пуста.
      </Typography>
    )
  }

  return (
    <Stack gap={2}>
      {entries.map((entry) => (
        <Box key={entry.id} className={styles.entry}>
          <span className={styles.dot} />
          <Typography variant="body2" fontWeight={600}>
            {entry.from_status
              ? `${TASK_STATUS_LABELS[entry.from_status]} → ${TASK_STATUS_LABELS[entry.to_status]}`
              : `Задача создана · ${TASK_STATUS_LABELS[entry.to_status]}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {entry.profile?.full_name ?? 'Пользователь'} ·{' '}
            {new Date(entry.created_at).toLocaleString('ru-RU')}
          </Typography>
          {entry.comment && (
            <Typography variant="body2" mt={0.5} className={styles.comment}>
              {entry.comment}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  )
}
