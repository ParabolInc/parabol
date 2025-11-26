import {Kysely} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type {DB} from '../../../oauth/dbTypes'
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
  _root: unknown,
  {input}: {input: UpdateOAuthAPIProviderInput},
  context: GQLContext
) {
  const {providerId, name, redirectUris, scopes} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const db = getKysely() as unknown as Kysely<DB>

  const provider = await db
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new Error('Provider not found')
  }

  if (!(await isUserOrgAdmin(viewerId, provider.organizationId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  const updateData: any = {
    updatedAt: new Date()
  }
  if (name !== undefined) updateData.name = name
  if (redirectUris !== undefined) updateData.redirectUris = redirectUris
  if (scopes !== undefined) updateData.scopes = scopes

  const updatedProvider = await db
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
