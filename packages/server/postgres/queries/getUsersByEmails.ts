import {selectUsers} from '../select'
import {User} from '../types/User'

export const getUsersByEmails = async (emails: string[]): Promise<User[]> => {
  return selectUsers()
    .where('User.email', 'in', emails)
    .execute() as Promise<unknown> as Promise<User[]>
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
