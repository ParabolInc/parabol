import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const updateOAuthAPIProvider: MutationResolvers['updateOAuthAPIProvider'] = async (
  _source,
  args,
  context
) => {
  const {name, redirectUris, scopes} = args
  const [providerId] = CipherId.fromClient(args.providerId)
  const {dataLoader} = context

  const provider = await dataLoader.get('oAuthProviders').load(providerId)
  if (!provider) {
    throw new GraphQLError('Provider not found', {extensions: {code: 'NOT_FOUND'}})
  }

  if (scopes && scopes.length === 0) {
    throw new GraphQLError('Must select at least one scope', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  await getKysely()
    .updateTable('OAuthAPIProvider')
    .set({
      name: name ?? undefined,
      redirectUris: redirectUris ?? undefined,
      scopes: scopes || undefined
    })
    .where('id', '=', providerId)
    .execute()
  dataLoader.get('oAuthProviders').clear(providerId)

  return {organizationId: provider.orgId, providerId}
}

export default updateOAuthAPIProvider
