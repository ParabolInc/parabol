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

  const provider = await dataLoader.get('oAuthProviders').load(providerId)
  if (!provider) {
    throw new GraphQLError('Provider not found', {extensions: {code: 'NOT_FOUND'}})
  }

  await getKysely().deleteFrom('OAuthAPIProvider').where('id', '=', providerId).execute()
  dataLoader.get('oAuthProviders').clear(providerId)

  return {success: true, deletedProviderId: args.providerId}
}

export default deleteOAuthAPIProvider
