import {GraphQLError} from 'graphql'
import {generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const regenerateOAuthAPIProviderSecret: MutationResolvers['regenerateOAuthAPIProviderSecret'] =
  async (_root, args, context) => {
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

    // System-level providers (orgId = null, e.g. the Mattermost plugin) are not
    // user-managed — they are configured via environment variables only.
    if (!provider.orgId) {
      throw new GraphQLError('Not authorized to manage system providers', {
        extensions: {code: 'FORBIDDEN'}
      })
    }

    if (!(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
      throw new GraphQLError('Not organization lead', {
        extensions: {
          code: 'FORBIDDEN',
          userId: viewerId
        }
      })
    }

    const newSecret = generateOAuthClientSecret()

    const updatedProvider = await pg
      .updateTable('OAuthAPIProvider')
      .set({
        clientSecret: newSecret
      })
      .where('id', '=', providerId)
      .returningAll()
      .executeTakeFirstOrThrow()

    return {clientSecret: newSecret, provider: updatedProvider}
  }

export default regenerateOAuthAPIProviderSecret
