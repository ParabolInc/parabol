import getPg from '../getPg'
import IUser from '../types/IUser'
import {getUsersByEmailsQuery} from './generated/getUsersByEmailsQuery'

export const getUsersByEmails = async (emails: string[]): Promise<IUser[]> => {
  const users = await getUsersByEmailsQuery.run({emails}, getPg())
  return users as unknown as IUser[]
}

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
