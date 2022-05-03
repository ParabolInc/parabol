import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import IUser from '../types/IUser'
import {getUsersByIdsQuery} from './generated/getUsersByIdsQuery'

export const getUsersByIds = async (userIds: MaybeReadonly<string[]>): Promise<IUser[]> => {
  const users = await getUsersByIdsQuery.run({ids: userIds}, getPg())
  return users as unknown as IUser[]
}

export const getUserById = async (id: string): Promise<IUser | null> => {
  const users = await getUsersByIds([id])
  return users[0] ?? null
}
