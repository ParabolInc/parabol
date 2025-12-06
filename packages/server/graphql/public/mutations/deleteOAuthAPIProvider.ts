import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface DeleteOAuthAPIProviderInput {
  providerId: string
}

export default async function deleteOAuthAPIProvider(
  _root: any,
  {input}: {input: DeleteOAuthAPIProviderInput},
  context: GQLContext
) {
  const {providerId} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()

  const provider = await pg
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

  await pg.deleteFrom('OAuthAPIProvider').where('id', '=', providerId).execute()

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
