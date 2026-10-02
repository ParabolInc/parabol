import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import {isSingleTenantSSO} from '../../../utils/getSAMLURLFromEmail'
import clearSAMLConnection from '../../mutations/helpers/clearSAMLConnection'
import type {MutationResolvers} from '../resolverTypes'

const disconnectSAML: MutationResolvers['disconnectSAML'] = async (
  _source,
  {samlId},
  {authToken, dataLoader}
) => {
  if (isSingleTenantSSO) {
    throw new GraphQLError(
      'SSO is the only way to sign in to this instance, so it cannot be disconnected'
    )
  }
  const viewerId = getUserId(authToken)
  await clearSAMLConnection('id', samlId, viewerId)
  dataLoader.clearAll('saml')
  const saml = await dataLoader.get('saml').loadNonNull(samlId)
  return {saml}
}

export default disconnectSAML
