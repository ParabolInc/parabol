import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const deleteOAuthAPIProvider: MutationResolvers['deleteOAuthAPIProvider'] = async (
  _root,
  {input},
  context
) => {
  const [providerId] = CipherId.fromClient(input.providerId)
  const {authToken, dataLoader, socketId} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select('orgId')
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new GraphQLError('Provider not found')
  }

  if (!(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
    throw new GraphQLError('Not organization lead', {
      extensions: {
        code: 'FORBIDDEN',
        userId: viewerId
      }
    })
  }

  await pg.deleteFrom('OAuthAPIProvider').where('id', '=', providerId).execute()

  const data = {
    providerId: input.providerId,
    organization: {
      id: provider.orgId
    }
  }
  publish(SubscriptionChannel.ORGANIZATION, provider.orgId, 'DeleteOAuthAPIProviderSuccess', data, {
    mutatorId: socketId
  })

  return {success: true, deletedProviderId: input.providerId}
}

export default deleteOAuthAPIProvider
