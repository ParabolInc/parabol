import {getUsersByEmailsQuery} from './generated/getUsersByEmailsQuery'
import getPg from '../getPg'
import IUser from '../types/IUser'

export const getUsersByEmails = async (emails: string[]): Promise<IUser[]> => {
  const users = await getUsersByEmailsQuery.run({emails}, getPg())
  return users as IUser[]
}

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
