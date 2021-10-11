import {getUsersByIdsQuery} from './generated/getUsersByIdsQuery'
import getPg from '../getPg'
import IUser from '../types/IUser'

export const getUsersByIds = async (userIds: string[]): Promise<IUser[]> => {
  const users = await getUsersByIdsQuery.run({ids: userIds}, getPg())
  return users as IUser[]
}

export const getUserById = async (id: string): Promise<IUser | null> => {
  const users = await getUsersByIds([id])
  return users[0] ?? null
}
