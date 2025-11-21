import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {validateOAuthScopes} from '../../../oauth/oauthScopes'
import {validateRedirectUris} from '../../../oauth/validateRedirectUri'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface UpdateOAuthAPIProviderInput {
  providerId: string
  name?: string
  redirectUris?: string[]
  scopes?: string[]
}

export default async function updateOAuthAPIProvider(
  _root: any,
  {input}: {input: UpdateOAuthAPIProviderInput},
  context: GQLContext
) {
  const {providerId, name, redirectUris, scopes} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    return standardError(new Error('Provider not found'), {
      userId: viewerId
    })
  }

  if (!(await isUserOrgAdmin(viewerId, provider.organizationId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  if (redirectUris !== undefined && !validateRedirectUris(redirectUris)) {
    return standardError(
      new Error(
        'Invalid redirect URIs. URIs must use HTTPS (or HTTP for localhost) and not contain fragments.'
      ),
      {
        userId: viewerId
      }
    )
  }

  if (scopes !== undefined && !validateOAuthScopes(scopes)) {
    return standardError(
      new Error('Invalid scopes. Only graphql:query and graphql:mutation are allowed.'),
      {
        userId: viewerId
      }
    )
  }

  const updateData: any = {
    updatedAt: new Date()
  }
  if (name !== undefined) updateData.name = name
  if (redirectUris !== undefined) updateData.redirectUris = redirectUris
  if (scopes !== undefined) updateData.scopes = scopes

  const updatedProvider = await pg
    .updateTable('OAuthAPIProvider')
    .set(updateData)
    .where('id', '=', providerId)
    .returningAll()
    .executeTakeFirst()

  const data = {
    provider: updatedProvider,
    organization: {
      id: provider.organizationId
    }
  }
  publish(
    SubscriptionChannel.ORGANIZATION,
    provider.organizationId,
    'UpdateOAuthAPIProviderSuccess',
    data,
    {}
  )

  return {provider: updatedProvider}
}
