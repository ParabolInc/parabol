import base64url from 'base64url'
import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import {getSSOMetadataFromURL} from '../../../utils/getSSOMetadataFromURL'
import {createSAMLMetadataChangeRequest} from '../../../utils/samlMetadataChangeRequest'
import type {SSORelayState} from '../queries/SAMLIdP'
import type {MutationResolvers} from '../resolverTypes'
import getSignOnURL from './helpers/SAMLHelpers/getSignOnURL'

const requestSAMLMetadataChange: MutationResolvers['requestSAMLMetadataChange'] = async (
  _source,
  {samlId, metadataURL},
  {authToken}
) => {
  const metadata = await getSSOMetadataFromURL(metadataURL)
  if (metadata instanceof Error) throw new GraphQLError(metadata.message)
  const baseUrl = getSignOnURL(metadata, samlId)
  if (baseUrl instanceof Error) throw new GraphQLError(baseUrl.message)
  // The IdP forwards the RelayState to loginSAML, which resolves the id back to this URL
  const metadataChangeId = await createSAMLMetadataChangeRequest({
    samlId,
    metadataURL,
    requestedBy: getUserId(authToken)
  })
  const relayState: SSORelayState = {metadataChangeId}
  const signOnURL = new URL(baseUrl)
  signOnURL.searchParams.append('RelayState', base64url.encode(JSON.stringify(relayState)))
  return {signOnURL: signOnURL.toString()}
}

export default requestSAMLMetadataChange
