import getAUserForDomain from '../../../postgres/queries/getAUserForDomain'
import isCompanyDomain from '../../../utils/isCompanyDomain'

const isPatientZero = async (domain?: string | null) => {
  if (!domain) return false
  if (!isCompanyDomain(domain)) return false
  const userWithSameDomain = await getAUserForDomain(domain)
  return !userWithSameDomain
}

export default isPatientZero
