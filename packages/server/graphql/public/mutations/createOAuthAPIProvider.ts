import {GraphQLError} from 'graphql'
import {verify} from 'jsonwebtoken'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import {validateOAuthScopes} from '../../../oauth2/oauthScopes'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const createOAuthAPIProvider: MutationResolvers['createOAuthAPIProvider'] = async (
  _source,
  {input},
  _context
) => {
  const {orgId, name, redirectUris, scopes, credentialToken} = input

  let clientId: string
  let clientSecret: string

  try {
    const decoded = verify(credentialToken, Buffer.from(process.env.SERVER_SECRET!, 'base64')) as {
      clientId: string
      clientSecret: string
    }
    clientId = decoded.clientId
    clientSecret = decoded.clientSecret
  } catch (_err) {
    throw new GraphQLError('Invalid or expired credential token', {
      extensions: {
        code: 'BAD_USER_INPUT'
      }
    })
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
    clientId,
    clientSecret,
    redirectUris,
    scopes: scopes as Oauthscopeenum[]
  }

  await pg.insertInto('OAuthAPIProvider').values(dbRow).execute()

  const provider = await selectOAuthAPIProvider()
    .where('id', '=', providerId)
    .executeTakeFirstOrThrow()

  const data = {
    provider,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret,
    organization: {
      id: orgId
    }
  }

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'CreateOAuthAPIProviderSuccess', data, {})

  return {
    provider,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret
  }
}

export default createOAuthAPIProvider
