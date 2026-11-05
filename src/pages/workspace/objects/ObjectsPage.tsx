import { Box, Button, Card, CardContent, IconButton, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { ConstructionObject, Task } from '../../../shared/api/database.types'
import styles from './ObjectsPage.module.css'

interface ObjectsPageProps {
  objects: ConstructionObject[]
  tasks: Task[]
  manager: boolean
  onCreate: () => void
  onEdit: (object: ConstructionObject) => void
  onDelete: (object: ConstructionObject) => void
}

export function ObjectsPage({
  objects,
  tasks,
  manager,
  onCreate,
  onEdit,
  onDelete,
}: ObjectsPageProps) {
  const subtitle = manager
    ? 'Площадки и задачи команды'
    : 'Объекты, по которым вам назначены задачи'

  if (objects.length === 0) {
    const emptyMessage = manager
      ? 'Объектов пока нет. Создайте первый, чтобы поставить задачу.'
      : 'Пока нет объектов с назначенными вам задачами. Они появятся здесь, когда постановщик назначит вам задачу.'

    return (
      <Box>
        <PageHeader manager={manager} subtitle={subtitle} onCreate={onCreate} />

        <Card>
          <CardContent>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box>
      <PageHeader manager={manager} subtitle={subtitle} onCreate={onCreate} />

      <Box className={styles.grid}>
        {objects.map((object) => {
          const objectTaskCount = tasks.filter((task) => task.object_id === object.id).length

          return (
            <Card key={object.id} className={styles.card}>
              <CardContent>
                <Typography variant="overline" color="primary">
                  СТРОИТЕЛЬНАЯ ПЛОЩАДКА
                </Typography>

                <Typography variant="h6" mt={1}>
                  {object.name}
                </Typography>

                <Typography color="text.secondary" variant="body2" mt={0.5}>
                  {object.address}
                </Typography>

                <Typography variant="body2" mt={2}>
                  {objectTaskCount} задач
                </Typography>

                <Button
                  component={Link}
                  to={`/objects/${object.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Открыть объект
                </Button>

                {manager && (
                  <>
                    <IconButton aria-label="Изменить объект" onClick={() => onEdit(object)}>
                      ✎
                    </IconButton>
                    <IconButton
                      aria-label="Удалить объект"
                      color="error"
                      onClick={() => onDelete(object)}
                    >
                      ×
                    </IconButton>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

interface PageHeaderProps {
  manager: boolean
  subtitle: string
  onCreate: () => void
}

function PageHeader({ manager, subtitle, onCreate }: PageHeaderProps) {
  return (
    <Box display="flex" justifyContent="space-between" mb={3}>
      <Box>
        <Typography variant="h4">Объекты</Typography>
        <Typography color="text.secondary" mt={0.5}>
          {subtitle}
        </Typography>
      </Box>

      {manager && (
        <Button variant="contained" onClick={onCreate}>
          + Новый объект
        </Button>
      )}
    </Box>
  )
}
