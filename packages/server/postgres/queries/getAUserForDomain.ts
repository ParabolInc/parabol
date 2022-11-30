import getPg from '../getPg'
import IUser from '../types/IUser'
import {getAUserForDomainQuery} from './generated/getAUserForDomainQuery'

const getAUserForDomain = async (domain: string): Promise<IUser> => {
  const usersInDomain = await getAUserForDomainQuery.run({domain}, getPg())
  return usersInDomain[0] as unknown as IUser
}

export default getAUserForDomain
