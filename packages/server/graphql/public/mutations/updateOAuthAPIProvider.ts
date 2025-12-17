import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {selectOAuthAPIProvider} from '../../../postgres/select'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthAPIProvider: MutationResolvers['updateOAuthAPIProvider'] = async (
  _source,
  {input},
  context
) => {
  const {name, redirectUris} = input
  let {scopes} = input
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

  if (scopes) {
    if (scopes && scopes.length === 0) {
      scopes = ['graphql:query', 'graphql:mutation']
    }
  }

  await pg
    .updateTable('OAuthAPIProvider')
    .set({
      name: name ?? undefined,
      redirectUris: redirectUris ?? undefined,
      scopes: scopes || undefined
    })
    .where('id', '=', providerId)
    .execute()

  const updatedProvider = await selectOAuthAPIProvider()
    .where('id', '=', providerId)
    .executeTakeFirstOrThrow()

  const data = {
    provider: updatedProvider,
    organization: {
      id: provider.orgId
    }
  }
  publish(SubscriptionChannel.ORGANIZATION, provider.orgId, 'UpdateOAuthAPIProviderSuccess', data, {
    mutatorId: socketId
  })

  return {
    provider: updatedProvider
  }
}

export default updateOAuthAPIProvider
