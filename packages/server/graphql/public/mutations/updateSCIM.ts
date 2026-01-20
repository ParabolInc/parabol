import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {
  generateBearerToken,
  generateOAuthClientId,
  generateOAuthClientSecret
} from '../../../scim/credentials'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const updateSCIM: MutationResolvers['updateSCIM'] = async (
  _source,
  {orgId, authenticationType},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  const saml = await dataLoader.get('samlByOrgId').load(orgId)
  if (!saml) {
    throw new GraphQLError('SAML must be enabled first to use SCIM')
  }
  const {id} = saml

  const scimAuthenticationType = authenticationType ?? null
  const scimBearerToken = authenticationType === 'bearerToken' ? generateBearerToken() : null
  const scimOAuthClientId =
    authenticationType === 'oauthClientCredentials' ? generateOAuthClientId() : null
  const scimOAuthClientSecret =
    authenticationType === 'oauthClientCredentials' ? generateOAuthClientSecret() : null

  await pg
    .updateTable('SAML')
    .set({
      lastUpdatedBy: viewerId,
      scimAuthenticationType,
      scimBearerToken,
      scimOAuthClientId,
      scimOAuthClientSecret
    })
    .where('id', '=', id)
    .execute()
  saml.scimBearerToken = scimBearerToken
  saml.scimOAuthClientId = scimOAuthClientId
  saml.scimOAuthClientSecret = scimOAuthClientSecret
  saml.scimAuthenticationType = scimAuthenticationType
  dataLoader.get('saml').prime(id, saml)

  const data = {
    saml,
    scimAuthenticationType: authenticationType,
    scimBearerToken,
    scimOAuthClientId,
    scimOAuthClientSecret
  }

  return data
}

export default updateSCIM
