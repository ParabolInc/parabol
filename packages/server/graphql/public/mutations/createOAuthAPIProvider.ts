import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

export const createOAuthAPIProvider: MutationResolvers['createOAuthAPIProvider'] = async (
  _,
  args,
  {dataLoader}
) => {
  let {scopes} = args
  const {orgId, name, redirectUris} = args

  const clientId = generateOAuthClientId()
  const clientSecret = generateOAuthClientSecret()

  if (scopes.length === 0) {
    scopes = ['graphql:query', 'graphql:mutation']
  }

  const pg = getKysely()

  const dbRow = {
    orgId,
    name,
    clientId,
    clientSecret,
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
    clientId,
    clientSecret
  }
}

export default createOAuthAPIProvider
