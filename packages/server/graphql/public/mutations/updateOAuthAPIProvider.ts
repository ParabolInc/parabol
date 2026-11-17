import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthAPIProvider: MutationResolvers['updateOAuthAPIProvider'] = async (
  _source,
  args,
  context
) => {
  const {name, redirectUris, scopes, clientType} = args
  const [providerId] = CipherId.fromClient(args.providerId)
  const {dataLoader, socketId} = context

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select(['orgId', 'clientId', 'clientType'])
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new GraphQLError('Provider not found', {extensions: {code: 'NOT_FOUND'}})
  }

  if (scopes && scopes.length === 0) {
    throw new GraphQLError('Must select at least one scope', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const isChangingClientType = !!clientType && clientType !== provider.clientType
  const clientSecret =
    isChangingClientType && clientType === 'confidential' ? generateOAuthClientSecret() : null

  await pg.transaction().execute(async (trx) => {
    await trx
      .updateTable('OAuthAPIProvider')
      .set({
        name: name ?? undefined,
        redirectUris: redirectUris ?? undefined,
        scopes: scopes || undefined,
        ...(isChangingClientType ? {clientType, clientSecret} : {})
      })
      .where('id', '=', providerId)
      .execute()
    if (isChangingClientType) {
      await trx
        .updateTable('OAuthAPIGrant')
        .set({revokedAt: sql`now()`})
        .where('clientId', '=', provider.clientId)
        .where('revokedAt', 'is', null)
        .execute()
    }
  })
  dataLoader.get('oAuthProviders').clear(providerId)

  const data = {
    organizationId: provider.orgId,
    providerId
  }

  publish(SubscriptionChannel.ORGANIZATION, provider.orgId, 'UpdateOAuthAPIProviderPayload', data, {
    mutatorId: socketId
  })

  return {...data, clientSecret}
}

export default updateOAuthAPIProvider
