import { supabase } from '../../../shared/api/supabase'

export async function fetchTaskHistory(taskId: string) {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  const { data, error } = await supabase
    .from('task_status_history')
    .select('*, profile:profiles(*)')
    .eq('task_id', taskId)
    .order('created_at')

  if (error) {
    throw error
  }

  return data
}
