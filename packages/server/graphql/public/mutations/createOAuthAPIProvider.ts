import {GraphQLError} from 'graphql'
import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

export const createOAuthAPIProvider: MutationResolvers['createOAuthAPIProvider'] = async (
  _,
  {scopes, clientType, orgId, name, redirectUris}
) => {
  if (scopes.length === 0) {
    throw new GraphQLError('Must select at least one scope')
  }

  const clientId = generateOAuthClientId()
  const clientSecret = clientType === 'public' ? null : generateOAuthClientSecret()

  const pg = getKysely()

  const {id: providerId} = await pg
    .insertInto('OAuthAPIProvider')
    .values({
      orgId,
      name,
      clientId,
      clientSecret,
      redirectUris,
      scopes,
      clientType
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  return {
    providerId,
    clientId,
    clientSecret
  }
}

export default createOAuthAPIProvider
