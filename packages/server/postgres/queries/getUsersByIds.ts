import type {MaybeReadonly} from '../../../client/types/generics'
import {selectUser} from '../select'

export const getUsersByIds = async (userIds: MaybeReadonly<string[]>) => {
  return selectUser().where('id', 'in', userIds).execute()
}

export const getUserById = async (id: string) => {
  const users = await getUsersByIds([id])
  return users[0] ?? null
}
