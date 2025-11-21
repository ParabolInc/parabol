import {selectUser} from '../select'

export const getUsersByEmails = async (emails: string[]) => {
  return selectUser().where('email', 'in', emails).execute()
}

export const getUserByEmail = async (email: string) => {
  const users = await getUsersByEmails([email])
  return users[0] ?? null
}
