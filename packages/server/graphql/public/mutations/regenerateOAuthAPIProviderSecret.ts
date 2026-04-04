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
      .set({
        clientSecret: newSecret
      })
      .where('id', '=', providerId)
      .returningAll()
      .executeTakeFirstOrThrow()

    return {clientSecret: newSecret, provider: updatedProvider}
  }

export default regenerateOAuthAPIProviderSecret
