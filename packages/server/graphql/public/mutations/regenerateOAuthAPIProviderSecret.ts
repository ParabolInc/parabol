import {GraphQLError} from 'graphql'
import {generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const regenerateOAuthAPIProviderSecret: MutationResolvers['regenerateOAuthAPIProviderSecret'] =
  async (_root, args) => {
    const [providerId] = CipherId.fromClient(args.providerId)

    const pg = getKysely()
    const newSecret = generateOAuthClientSecret()

    const updatedProvider = await pg
      .updateTable('OAuthAPIProvider')
      .set({clientSecret: newSecret})
      .where('id', '=', providerId)
      .where('clientType', '=', 'confidential')
      .returningAll()
      .executeTakeFirst()

    if (!updatedProvider) {
      const provider = await pg
        .selectFrom('OAuthAPIProvider')
        .select('id')
        .where('id', '=', providerId)
        .executeTakeFirst()
      if (!provider) {
        throw new GraphQLError('Provider not found', {extensions: {code: 'NOT_FOUND'}})
      }
      throw new GraphQLError('A public client has no secret to regenerate', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }

    return {clientSecret: newSecret, provider: updatedProvider}
  }

export default regenerateOAuthAPIProviderSecret
