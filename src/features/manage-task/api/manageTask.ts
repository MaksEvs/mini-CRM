import type { Task } from '../../../shared/api/database.types'
import { supabase } from '../../../shared/api/supabase'

export async function saveTask(
  input: Pick<Task, 'title' | 'description' | 'object_id' | 'assignee_id'>,
  id?: string,
): Promise<void> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }
  const values = {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
  }
  const result = id
    ? await supabase.from('tasks').update(values).eq('id', id)
    : await supabase.from('tasks').insert(values)
  if (result.error) {
    throw result.error
  }
}

export async function removeTask(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    throw error
  }
}
