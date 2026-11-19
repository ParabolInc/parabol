import {GraphQLError} from 'graphql'
import {generateOAuthClientId} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

export const createOAuthAPIProvider: MutationResolvers['createOAuthAPIProvider'] = async (
  _,
  args,
  {dataLoader}
) => {
  const {orgId, name, redirectUris, scopes} = args

  const clientId = generateOAuthClientId()

  if (scopes.length === 0) {
    throw new GraphQLError('Must pick a scope', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const pg = getKysely()

  const dbRow = {
    orgId,
    name,
    clientId,
    redirectUris,
    scopes
  }

  const {id: providerId} = await pg
    .insertInto('OAuthAPIProvider')
    .values(dbRow)
    .returning('id')
    .executeTakeFirstOrThrow()

  dataLoader.clearAll('oAuthProviders')
  const provider = await dataLoader.get('oAuthProviders').loadNonNull(providerId)

  return {
    providerId: provider.id,
    clientId
  }
}

export default createOAuthAPIProvider
