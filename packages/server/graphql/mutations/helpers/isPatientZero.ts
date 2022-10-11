import getPatientZeroByDomain from '../../../postgres/queries/getPatientZeroByDomain'

const isPatientZero = async (userId: string, domain?: string | null) => {
  if (domain) {
    const patient0 = await getPatientZeroByDomain(domain)
    if (!patient0) {
      return true
    } else {
      return userId === patient0.id
    }
  } else {
    return false
  }
}

export default isPatientZero
