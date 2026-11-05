import {
  deleteObject as deleteObjectEntity,
  saveObject as saveObjectEntity,
} from '../../../entities/object'
import type { ConstructionObject } from '../../../shared/api/database.types'

export async function manageObject(
  input: Pick<ConstructionObject, 'name' | 'address'>,
  id?: string,
): Promise<void> {
  await saveObjectEntity({ name: input.name.trim(), address: input.address.trim() }, id)
}

export async function removeObject(id: string): Promise<void> {
  await deleteObjectEntity(id)
}
