import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const deleteOAuthAPIProvider: MutationResolvers['deleteOAuthAPIProvider'] = async (
  _root,
  args,
  context
) => {
  const [providerId] = CipherId.fromClient(args.providerId)
  const {dataLoader} = context

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select('orgId')
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new GraphQLError('Provider not found')
  }

  await pg.deleteFrom('OAuthAPIProvider').where('id', '=', providerId).execute()
  dataLoader.get('oAuthProviders').clear(providerId)

  return {success: true, deletedProviderId: args.providerId}
}

export default deleteOAuthAPIProvider
