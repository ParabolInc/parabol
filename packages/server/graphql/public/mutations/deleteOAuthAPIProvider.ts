import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const deleteOAuthAPIProvider: MutationResolvers['deleteOAuthAPIProvider'] = async (
  _root,
  args,
  context
) => {
  const [providerId] = CipherId.fromClient(args.providerId)
  const {authToken, dataLoader} = context
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

  return {success: true, deletedProviderId: args.providerId}
}

export default deleteOAuthAPIProvider
