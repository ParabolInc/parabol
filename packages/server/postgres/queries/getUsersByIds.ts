import {MaybeReadonly} from '../../../client/types/generics'
import {selectUsers} from '../select'
import {User} from '../types/User'

export const getUsersByIds = async (userIds: MaybeReadonly<string[]>): Promise<User[]> => {
  const users = await selectUsers().where('id', 'in', userIds).execute()
  return users as unknown[] as User[]
}

export const getUserById = async (id: string): Promise<User | null> => {
  const users = await getUsersByIds([id])
  return users[0] ?? null
}
