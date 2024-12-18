import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'

const getSAMLConfigForDomain = async (domain: string) => {
  const pg = getKysely()

  const response = await pg
    .selectFrom('SAML')
    .innerJoin('SAMLDomain', 'SAML.id', 'SAMLDomain.samlId')
    .select(['SAML.id as slug', 'SAML.orgId'])
    .where('SAMLDomain.domain', '=', domain.toLowerCase())
    .executeTakeFirst()

  if (!response) {
    return standardError(new Error('No SAML configuration found for domain'))
  }
  return response
}

export default getSAMLConfigForDomain
