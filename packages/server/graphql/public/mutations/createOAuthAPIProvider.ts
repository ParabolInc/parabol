import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import {OAUTH_SCOPES, validateOAuthScopes} from '../../../oauth2/oauthScopes'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
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
    scopes = [OAUTH_SCOPES['graphql:query'], OAUTH_SCOPES['graphql:mutation']]
  }

  if (!validateOAuthScopes(scopes)) {
    throw new GraphQLError('Invalid scopes.', {
      extensions: {
        code: 'BAD_USER_INPUT'
      }
    })
  }

  const pg = getKysely()

  const dbRow = {
    orgId,
    name,
    clientId,
    clientSecret,
    redirectUris,
    scopes: scopes as Oauthscopeenum[]
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
