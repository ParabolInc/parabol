import getPg from '../getPg'
import type IUser from '../types/IUser'
import {getUsersByDomainQuery} from './generated/getUsersByDomainQuery'

const getUsersByDomain = async (domain: string): Promise<IUser[]> => {
  const users = await getUsersByDomainQuery.run({domain}, getPg())
  return users as unknown as IUser[]
}

export default getUsersByDomain
