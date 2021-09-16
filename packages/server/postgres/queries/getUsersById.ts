import {getUsersByIdQuery} from './generated/getUsersByIdQuery'
import getPg from '../getPg'
import IUser from '../types/IUser'

export const getUsersById = async (userIds: string[]): Promise<IUser[]> => {
  const users = await getUsersByIdQuery.run({ids: userIds}, getPg())
  return users as IUser[]
}

export const getUserById = async (id: string): Promise<IUser | null> => {
  const users = await getUsersById([id])
  return users[0] ?? null
}
