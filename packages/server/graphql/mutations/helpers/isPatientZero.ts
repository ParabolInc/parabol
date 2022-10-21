import getPatientZeroByDomain from '../../../postgres/queries/getPatientZeroByDomain'
import isCompanyDomain from '../../../utils/isCompanyDomain'

const isPatientZero = async (domain?: string | null) => {
  if (!domain) return false
  if (!isCompanyDomain(domain)) return false
  const userWithSameDomain = await getPatientZeroByDomain(domain)
  return !userWithSameDomain
}

export default isPatientZero
