import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import {QueryResolvers} from '../resolverTypes'

const getSAMLForDomain: QueryResolvers['getSAMLForDomain'] = async (_parent, {domain}) => {
  const pg = getKysely()

  const samlResult = await pg
    .selectFrom('SAML')
    .innerJoin('SAMLDomain', 'SAML.id', 'SAMLDomain.samlId')
    .selectAll('SAML')
    .where('SAMLDomain.domain', '=', domain.toLowerCase())
    .executeTakeFirst()

  if (!samlResult) {
    return standardError(new Error('No SAML configuration found for domain'))
  }
  return {
    saml: samlResult
  }
}

export default getSAMLForDomain
