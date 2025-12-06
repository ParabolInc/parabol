import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import OAuthAPIProvider from '../../../database/types/OAuthAPIProvider'
import generateRandomString from '../../../generateRandomString'
import {validateOAuthScopes} from '../../../oauth/oauthScopes'
import {validateRedirectUris} from '../../../oauth/validateRedirectUri'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface CreateOAuthAPIProviderInput {
  orgId: string
  name: string
  redirectUris: string[]
  scopes: string[]
  clientId?: string
  clientSecret?: string
}

export default async function createOAuthAPIProvider(
  _root: any,
  {input}: {input: CreateOAuthAPIProviderInput},
  context: GQLContext
) {
  const {orgId, name, redirectUris, scopes, clientId, clientSecret} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  if (!(await isUserOrgAdmin(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  if (!validateRedirectUris(redirectUris)) {
    return standardError(
      new Error(
        'Invalid redirect URIs. URIs must use HTTPS (or HTTP for localhost) and not contain fragments.'
      ),
      {
        userId: viewerId
      }
    )
  }

  if (!validateOAuthScopes(scopes)) {
    return standardError(
      new Error('Invalid scopes. Only graphql:query and graphql:mutation are allowed.'),
      {
        userId: viewerId
      }
    )
  }

  const pg = getKysely()

  const provider = new OAuthAPIProvider({
    organizationId: orgId,
    name,
    clientId: clientId || 'prbl-cid-' + generateRandomString(16),
    clientSecret: clientSecret || 'prbl-s-' + generateRandomString(32),
    redirectUris,
    scopes
  })

  await pg.insertInto('OAuthAPIProvider').values(provider).execute()

  const data = {
    provider,
    organization: {
      id: orgId
    }
  }
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'CreateOAuthAPIProviderSuccess', data, {})

  return {provider}
}
