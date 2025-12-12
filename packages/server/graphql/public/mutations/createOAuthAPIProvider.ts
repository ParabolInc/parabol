import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import {generateOAuthClientId, generateOAuthClientSecret} from '../../../oauth2/credentials'
import {validateOAuthScopes} from '../../../oauth2/oauthScopes'
import {validateRedirectUris} from '../../../oauth2/validateRedirectUri'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
import publish from '../../../utils/publish'
import {GQLContext} from '../../graphql'

interface CreateOAuthAPIProviderInput {
  orgId: string
  name: string
  redirectUris: string[]
  scopes: string[]
}

export default async function createOAuthAPIProvider(
  _root: any,
  {input}: {input: CreateOAuthAPIProviderInput},
  _context: GQLContext
) {
  const {orgId, name, redirectUris, scopes} = input

  if (!validateRedirectUris(redirectUris)) {
    throw new GraphQLError(
      'Invalid redirect URIs. URIs must use HTTPS (or HTTP for localhost) and not contain fragments.',
      {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      }
    )
  }

  if (!validateOAuthScopes(scopes)) {
    throw new GraphQLError('Invalid scopes. Only graphql:read and graphql:write are allowed.', {
      extensions: {
        code: 'BAD_USER_INPUT'
      }
    })
  }

  const pg = getKysely()

  const providerId = generateUID()
  const dbRow = {
    id: providerId,
    orgId,
    name,
    clientId: generateOAuthClientId(),
    clientSecret: generateOAuthClientSecret(),
    redirectUris,
    scopes: scopes as Oauthscopeenum[]
  }

  await pg.insertInto('OAuthAPIProvider').values(dbRow).execute()

  const provider = await selectOAuthAPIProvider()
    .where('id', '=', providerId)
    .executeTakeFirstOrThrow()

  const data = {
    provider,
    organization: {
      id: orgId
    }
  }

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'CreateOAuthAPIProviderSuccess', data, {})

  return {provider}
}
