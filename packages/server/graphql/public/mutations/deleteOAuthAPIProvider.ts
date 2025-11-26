import {Kysely} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface DeleteOAuthAPIProviderInput {
  providerId: string
}

export default async function deleteOAuthAPIProvider(
  _root: unknown,
  {input}: {input: DeleteOAuthAPIProviderInput},
  context: GQLContext
) {
  const {providerId} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const db = getKysely() as unknown as Kysely<DB>

  const provider = await db
    .selectFrom('OAuthAPIProvider')
    .select('organizationId')
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

  await db.deleteFrom('OAuthAPIProvider').where('id', '=', providerId).execute()

  const data = {
    providerId,
    organization: {
      id: provider.organizationId
    }
  }
  publish(
    SubscriptionChannel.ORGANIZATION,
    provider.organizationId,
    'DeleteOAuthAPIProviderSuccess',
    data,
    {}
  )

  return {success: true, deletedProviderId: providerId}
}
