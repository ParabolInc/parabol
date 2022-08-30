import getPatientZeroByDomain from '../../../postgres/queries/getPatientZeroByDomain'

const isPatientZero = async (userId: string, domain?: string | null) =>
  domain ? userId === (await getPatientZeroByDomain(domain)).id : false

export default isPatientZero
