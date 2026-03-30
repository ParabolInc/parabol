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
  const clientType = args.clientType ?? 'confidential'

  const clientId = generateOAuthClientId()
  const clientSecret = clientType === 'public' ? null : generateOAuthClientSecret()

  if (scopes.length === 0) {
    scopes = ['read']
  }

  const pg = getKysely()

  const dbRow = {
    orgId,
    name,
    clientId,
    clientSecret,
    redirectUris: clientType === 'public' ? [] : redirectUris,
    scopes,
    clientType
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
