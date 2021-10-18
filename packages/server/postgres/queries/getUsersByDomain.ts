import {getUsersByDomainQuery} from './generated/getUsersByDomainQuery'
import getPg from '../getPg'
import IUser from '../types/IUser'

const getUsersByDomain = async (domain: string): Promise<IUser[]> => {
  const users = await getUsersByDomainQuery.run({domain}, getPg())
  return users as IUser[]
}

export default getUsersByDomain
