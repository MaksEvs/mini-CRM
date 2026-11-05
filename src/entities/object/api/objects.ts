import { supabase } from '../../../shared/api/supabase'
import type { ConstructionObject } from '../../../shared/api/database.types'

export async function saveObject(
  input: Pick<ConstructionObject, 'name' | 'address'>,
  id?: string,
): Promise<void> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  let result

  if (id) {
    result = await supabase.from('construction_objects').update(input).eq('id', id)
  } else {
    result = await supabase.from('construction_objects').insert(input)
  }

  if (result.error) {
    throw result.error
  }
}

export async function deleteObject(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Не настроено подключение к Supabase.')
  }

  const { error } = await supabase.from('construction_objects').delete().eq('id', id)

  if (error) {
    throw error
  }
}
