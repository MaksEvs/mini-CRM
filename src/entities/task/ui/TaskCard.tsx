import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Profile, Task, TaskStatus } from '../../../shared/api/database.types'
import { getAvailableTaskActions } from '../model/status'
import { TaskStatusChip } from './TaskStatusChip'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  manager: boolean
  profile: Profile
  busy: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onTransition: (task: Task, status: TaskStatus) => void
}

export function TaskCard({
  task,
  manager,
  profile,
  busy,
  onEdit,
  onDelete,
  onTransition,
}: TaskCardProps) {
  const actions = getAvailableTaskActions(task, profile)

  return (
    <Card className={styles.card}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component={Link}
              to={`/tasks/${task.id}`}
              className={styles.link}
              variant="subtitle1"
            >
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {task.object?.name ?? 'Объект'}
            </Typography>
          </Box>

          <TaskStatusChip status={task.status} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Typography variant="caption" color="text.secondary">
            {manager ? (task.assignee?.full_name ?? 'Исполнитель') : 'Исполнитель'}
            {' · '}
            {new Date(task.created_at).toLocaleDateString('ru-RU')}
          </Typography>

          {manager && (
            <Stack direction="row" gap={0.5}>
              <Button size="small" onClick={() => onEdit(task)}>
                Изменить
              </Button>
              <Button size="small" color="error" onClick={() => onDelete(task)}>
                Удалить
              </Button>
            </Stack>
          )}
        </Stack>

        {actions.length > 0 && (
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
            {actions.map((action) => (
              <Button
                key={action.status}
                variant={action.status === 'accepted' ? 'contained' : 'outlined'}
                size="small"
                disabled={busy}
                onClick={() => onTransition(task, action.status)}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
