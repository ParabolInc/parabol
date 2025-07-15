import standardError from '../../../utils/standardError'
import {QueryResolvers} from '../resolverTypes'

const getSAMLForDomain: QueryResolvers['getSAMLForDomain'] = async (
  _parent,
  {domain},
  {dataLoader}
) => {
  const samlResult = await dataLoader.get('samlByDomain').load(domain.toLowerCase())

  if (!samlResult) {
    return standardError(new Error('No SAML configuration found for domain'))
  }
  return {
    saml: samlResult
  }
}

export default getSAMLForDomain
