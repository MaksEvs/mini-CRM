import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { ConstructionObject, Task, Profile } from '../../../shared/api/database.types'
import { TaskCard } from '../../../entities/task'
import styles from './ObjectDetailsPage.module.css'

export function ObjectDetailsPage({
  object,
  tasks,
  manager,
  profile,
  busy,
  onCreateTask,
  onEditObject,
  onEditTask,
  onDeleteTask,
  onTransition,
}: {
  object: ConstructionObject
  tasks: Task[]
  manager: boolean
  profile: Profile
  busy: boolean
  onCreateTask: () => void
  onEditObject: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onTransition: (task: Task, status: Task['status']) => void
}) {
  return (
    <Box>
      <Button
        component={Link}
        to={manager ? '/objects' : '/my-tasks'}
        className={styles.backButton}
      >
        ← Все объекты
      </Button>

      <Typography variant="overline" color="primary">
        ОБЪЕКТ
      </Typography>
      <Typography variant="h4">{object.name}</Typography>
      <Typography color="text.secondary" mt={1}>
        {object.address}
      </Typography>

      {manager && (
        <Box className={styles.managerActions}>
          <Button variant="outlined" onClick={onCreateTask}>
            + Создать задачу
          </Button>
          <Button onClick={onEditObject}>Изменить объект</Button>
        </Box>
      )}

      <Typography variant="h6" className={styles.taskHeading}>
        Задачи объекта
      </Typography>

      <Box className={styles.taskList}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              manager={manager}
              profile={profile}
              busy={busy}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onTransition={onTransition}
            />
          ))
        ) : (
          <Typography color="text.secondary">В этом объекте пока нет доступных задач.</Typography>
        )}
      </Box>
    </Box>
  )
}
