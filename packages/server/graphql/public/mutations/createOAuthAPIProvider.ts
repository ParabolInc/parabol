import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

export const createOAuthAPIProvider: MutationResolvers['createOAuthAPIProvider'] = async (
  _,
  args,
  _context
) => {
  const {input} = args
  let {scopes = []} = input
  const {orgId, name, redirectUris} = input

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

  const provider = await selectOAuthAPIProvider()
    .where('id', '=', providerId)
    .executeTakeFirstOrThrow()

  const data = {
    provider,
    clientId: provider.clientId,
    organization: {
      id: orgId
    }
  }

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'CreateOAuthAPIProviderSuccess', data, {})

  return {
    providerId: provider.id,
    clientId,
    clientSecret
  }
}

export default createOAuthAPIProvider
