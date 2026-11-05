import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Snackbar,
} from '@mui/material'
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { hasSupabaseConfig, supabase } from '../../shared/api/supabase'
import type { Task, TaskStatus } from '../../shared/api/database.types'
import { WorkspaceDialog } from '../../widgets/workspace-dialog'
import { WorkspaceLayout } from '../../widgets/workspace-layout'
import { MyTasksPage } from './my-tasks/MyTasksPage'
import { ObjectDetailsPage } from './object-details/ObjectDetailsPage'
import { ObjectsPage } from './objects/ObjectsPage'
import { TaskDetailsPage } from './task-details/TaskDetailsPage'
import { useWorkspace } from './model/useWorkspace'
import styles from './WorkspacePage.module.css'

export function WorkspacePage() {
  const { session, profile, loading } = useAuth()
  const workspace = useWorkspace(profile)
  const location = useLocation()
  const navigate = useNavigate()
  const objectId = useMatch('/objects/:objectId')?.params.objectId
  const taskId = useMatch('/tasks/:taskId')?.params.taskId

  if (!hasSupabaseConfig) {
    return <SupabaseConfigurationMessage />
  }

  if (loading) {
    return <WorkspaceLoading />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <MissingProfileMessage />
  }

  const manager = profile.role === 'manager'
  const rootPath = manager ? '/objects' : '/my-tasks'
  const visibleTasks = manager
    ? workspace.tasks
    : workspace.tasks.filter((task) => task.assignee_id === profile.id)
  const currentObject = workspace.objects.find((object) => object.id === objectId)
  const currentTask = visibleTasks.find((task) => task.id === taskId)
  const title = getPageTitle(location.pathname, currentObject?.name, currentTask?.title)

  async function handleDeleteTask(task: Task): Promise<void> {
    const shouldNavigate = await workspace.deleteTask(task, location.pathname)

    if (shouldNavigate) {
      navigate(rootPath)
    }
  }

  function handleLogout(): void {
    void supabase?.auth.signOut()
    navigate('/login')
  }

  const taskActions = {
    busy: workspace.busy,
    onEditTask: workspace.openTaskForm,
    onDeleteTask: (task: Task) => void handleDeleteTask(task),
    onTransition: workspace.transitionTask,
  }

  return (
    <WorkspaceLayout profile={profile} title={title} onLogout={handleLogout}>
      <Routes>
        <Route
          path="/objects"
          element={
            <ObjectsPage
              objects={workspace.objects}
              tasks={workspace.tasks}
              manager={manager}
              onCreate={() => workspace.openObjectForm()}
              onEdit={workspace.openObjectForm}
              onDelete={(object) => void workspace.deleteObject(object)}
            />
          }
        />

        <Route
          path="/objects/:objectId"
          element={
            currentObject ? (
              <ObjectDetailsPage
                object={currentObject}
                tasks={visibleTasks.filter((task) => task.object_id === currentObject.id)}
                manager={manager}
                profile={profile}
                {...taskActions}
                onCreateTask={() => workspace.openTaskForm(undefined, currentObject.id)}
                onEditObject={() => workspace.openObjectForm(currentObject)}
              />
            ) : (
              <Alert severity="info">Объект не найден или у вас нет к нему доступа.</Alert>
            )
          }
        />

        <Route
          path="/my-tasks"
          element={
            !manager ? (
              <MyTasksPage
                tasks={visibleTasks}
                profile={profile}
                filter={workspace.filter}
                busy={workspace.busy}
                onFilter={workspace.setFilter}
                onEditTask={workspace.openTaskForm}
                onDeleteTask={(task) => void handleDeleteTask(task)}
                onTransition={workspace.transitionTask}
              />
            ) : (
              <Navigate to="/objects" replace />
            )
          }
        />

        <Route
          path="/tasks/:taskId"
          element={
            currentTask ? (
              <TaskDetailsPage
                task={currentTask}
                profile={profile}
                manager={manager}
                onTransition={(status: TaskStatus) =>
                  void workspace.transitionTask(currentTask, status)
                }
                onEdit={() => workspace.openTaskForm(currentTask)}
                onDelete={() => void handleDeleteTask(currentTask)}
              />
            ) : (
              <Alert severity="info">Задача не найдена или у вас нет к ней доступа.</Alert>
            )
          }
        />

        <Route path="*" element={<Navigate to={rootPath} replace />} />
      </Routes>

      <WorkspaceDialog
        kind={workspace.dialog}
        busy={workspace.busy}
        values={workspace.form}
        objects={workspace.objects}
        executors={workspace.executors}
        onChange={workspace.updateFormField}
        onClose={workspace.closeDialog}
        onSubmit={(event) => void workspace.submitForm(event)}
      />

      <Snackbar
        open={Boolean(workspace.notice)}
        autoHideDuration={5000}
        onClose={() => workspace.setNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={getNoticeSeverity(workspace.notice)}
          onClose={() => workspace.setNotice('')}
        >
          {workspace.notice}
        </Alert>
      </Snackbar>
    </WorkspaceLayout>
  )
}

function getPageTitle(pathname: string, objectName?: string, taskTitle?: string): string {
  if (taskTitle) {
    return taskTitle
  }

  if (objectName) {
    return objectName
  }

  return pathname === '/my-tasks' ? 'Мои задачи' : 'Объекты'
}

function getNoticeSeverity(notice: string): 'error' | 'success' {
  const errorWords = ['недостаточно', 'ошиб', 'обязателен', 'не найдены']
  const isError = errorWords.some((word) => notice.includes(word))

  return isError ? 'error' : 'success'
}

function SupabaseConfigurationMessage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent sx={{ p: 5 }}>
          <Alert severity="warning">
            Настройте Supabase: задайте URL и публичный ключ, примените миграции и перезапустите
            приложение.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  )
}

function WorkspaceLoading() {
  return (
    <Box className={styles.centerScreen}>
      <CircularProgress />
    </Box>
  )
}

function MissingProfileMessage() {
  return (
    <Box className={styles.centerScreen}>
      <Alert severity="warning">
        Для этого аккаунта не создан профиль. Попросите администратора добавить запись в profiles.
      </Alert>
      <Button onClick={() => void supabase?.auth.signOut()}>Выйти</Button>
    </Box>
  )
}
