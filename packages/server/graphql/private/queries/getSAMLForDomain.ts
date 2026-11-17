import {GraphQLError} from 'graphql'
import type {QueryResolvers} from '../resolverTypes'

const getSAMLForDomain: QueryResolvers['getSAMLForDomain'] = async (
  _parent,
  {domain},
  {dataLoader}
) => {
  const samlResult = await dataLoader.get('samlByDomain').load(domain.toLowerCase())

  if (!samlResult) {
    throw new GraphQLError('No SAML configuration found for domain', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  return {
    saml: samlResult
  }
}

export default getSAMLForDomain
