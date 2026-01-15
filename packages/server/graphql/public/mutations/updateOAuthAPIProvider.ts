import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthAPIProvider: MutationResolvers['updateOAuthAPIProvider'] = async (
  _source,
  args,
  context
) => {
  const {name, redirectUris} = args
  let {scopes} = args
  const [providerId] = CipherId.fromClient(args.providerId)
  const {dataLoader, socketId} = context

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select('orgId')
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new GraphQLError('Provider not found')
  }

  if (scopes && scopes.length === 0) {
    throw new GraphQLError('Must select at least one scope')
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
  dataLoader.get('oAuthProviders').clear(providerId)

  const data = {
    organizationId: provider.orgId,
    providerId
  }

  publish(SubscriptionChannel.ORGANIZATION, provider.orgId, 'UpdateOAuthAPIProviderPayload', data, {
    mutatorId: socketId
  })

  return data
}

export default updateOAuthAPIProvider
