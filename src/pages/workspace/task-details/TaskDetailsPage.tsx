import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { TaskHistory, TaskStatusChip, getAvailableTaskActions } from '../../../entities/task'
import type { Profile, Task, TaskStatus } from '../../../shared/api/database.types'
import styles from './TaskDetailsPage.module.css'

export function TaskDetailsPage({
  task,
  profile,
  manager,
  onTransition,
  onEdit,
  onDelete,
}: {
  task: Task
  profile: Profile
  manager: boolean
  onTransition: (status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const actions = getAvailableTaskActions(task, profile)
  return (
    <Box>
      <Button component={Link} to={manager ? '/objects' : '/my-tasks'} sx={{ mb: 2 }}>
        ← Назад к списку
      </Button>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="primary">
              ЗАДАЧА · {task.object?.name ?? 'ОБЪЕКТ'}
            </Typography>
            <Typography variant="h4">{task.title}</Typography>
            <TaskStatusChip status={task.status} />

            <Typography color="text.secondary" mt={3} whiteSpace="pre-wrap">
              {task.description}
            </Typography>

            <Box mt={3}>
              <Typography>Объект: {task.object?.name ?? '—'}</Typography>
              <Typography>Исполнитель: {task.assignee?.full_name ?? '—'}</Typography>
              <Typography>Постановщик: {task.author?.full_name ?? '—'}</Typography>
              <Typography>
                Создана: {new Date(task.created_at).toLocaleDateString('ru-RU')}
              </Typography>
            </Box>

            {actions.map((action) => (
              <Button key={action.status} onClick={() => onTransition(action.status)}>
                {action.label}
              </Button>
            ))}

            {manager && (
              <>
                <Button onClick={onEdit}>Изменить задачу</Button>
                <Button color="error" onClick={onDelete}>
                  Удалить
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={styles.historyCard}>
          <CardContent>
            <Typography variant="h6">История изменений</Typography>
            <TaskHistory taskId={task.id} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
