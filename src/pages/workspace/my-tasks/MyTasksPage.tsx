import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import type { Task, TaskStatus, Profile } from '../../../shared/api/database.types'
import { TASK_STATUS_LABELS, TaskCard } from '../../../entities/task'
import styles from './MyTasksPage.module.css'

export function MyTasksPage({
  tasks,
  profile,
  filter,
  busy,
  onFilter,
  onEditTask,
  onDeleteTask,
  onTransition,
}: {
  tasks: Task[]
  profile: Profile
  filter: TaskStatus | 'all'
  busy: boolean
  onFilter: (status: TaskStatus | 'all') => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onTransition: (task: Task, status: TaskStatus) => void
}) {
  const filteredTasks = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)

  return (
    <Box>
      <Typography variant="h4">Мои задачи</Typography>
      <Typography color="text.secondary" mt={0.5} mb={3}>
        Рабочий список назначенных вам задач
      </Typography>

      <FormControl size="small" className={styles.filter}>
        <InputLabel id="filter-label">Статус</InputLabel>
        <Select
          labelId="filter-label"
          label="Статус"
          value={filter}
          onChange={(event) => onFilter(event.target.value as TaskStatus | 'all')}
        >
          <MenuItem value="all">Все статусы</MenuItem>
          {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => (
            <MenuItem key={status} value={status}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box className={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              manager={false}
              profile={profile}
              busy={busy}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onTransition={onTransition}
            />
          ))
        ) : (
          <Typography color="text.secondary">Задач с таким статусом пока нет.</Typography>
        )}
      </Box>
    </Box>
  )
}
