import getPg from '../getPg'
import IUser from '../types/IUser'
import {getPatientZeroByDomainQuery} from './generated/getPatientZeroByDomainQuery'

const getPatient0ByDomain = async (domain: string): Promise<IUser> => {
  const usersInDomain = await getPatientZeroByDomainQuery.run({domain}, getPg())
  return usersInDomain[0] as unknown as IUser
}

export default getPatient0ByDomain
