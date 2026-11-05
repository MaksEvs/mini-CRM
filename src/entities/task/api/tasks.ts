import { supabase } from '../../../shared/api/supabase'
import type {
  ConstructionObject,
  Profile,
  Task,
  TaskStatus,
} from '../../../shared/api/database.types'

export interface WorkspaceData {
  objects: ConstructionObject[]
  tasks: Task[]
  executors: Profile[]
}

export async function fetchWorkspaceData(profile: Profile): Promise<WorkspaceData> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  const objectsQuery = supabase
    .from('construction_objects')
    .select('*')
    .order('created_at', { ascending: false })
  const tasksQuery = supabase
    .from('tasks')
    .select(
      '*, object:construction_objects(*), assignee:profiles!tasks_assignee_id_fkey(*), author:profiles!tasks_author_id_fkey(*)',
    )
    .order('created_at', { ascending: false })
  const profilesQuery =
    profile.role === 'manager'
      ? supabase.from('profiles').select('*').eq('role', 'executor').order('full_name')
      : Promise.resolve({ data: [], error: null })

  const [objectsResult, tasksResult, profilesResult] = await Promise.all([
    objectsQuery,
    tasksQuery,
    profilesQuery,
  ])

  const error = objectsResult.error ?? tasksResult.error ?? profilesResult.error
  if (error) {
    throw error
  }

  return {
    objects: objectsResult.data ?? [],
    tasks: (tasksResult.data ?? []) as Task[],
    executors: profilesResult.data ?? [],
  }
}

export async function transitionTask(
  taskId: string,
  status: TaskStatus,
  comment: string | null = null,
): Promise<void> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  const { error } = await supabase.rpc('transition_task_status', {
    p_task_id: taskId,
    p_new_status: status,
    p_comment: comment,
  })

  if (error) {
    throw error
  }
}
