import {selectUsers} from '../select'
import {User} from '../types/User'

const getUsersByDomain = async (domain: string): Promise<User[]> => {
  const users = await selectUsers().where('domain', '=', domain).execute()
  return users as unknown[] as User[]
}

export default getUsersByDomain
