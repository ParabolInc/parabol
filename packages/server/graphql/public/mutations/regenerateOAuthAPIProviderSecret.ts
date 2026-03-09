import {GraphQLError} from 'graphql'
import {generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {PageId} from '../../../shared/gqlIds/PageId'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const regenerateOAuthAPIProviderSecret: MutationResolvers['regenerateOAuthAPIProviderSecret'] =
  async (_root, args, context) => {
    const providerId = PageId.split(args.providerId)
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
