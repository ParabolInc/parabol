import {GraphQLError} from 'graphql'
import {generateOAuthClientSecret} from '../../../oauth2/credentials'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {GQLContext} from '../../graphql'

interface RegenerateOAuthAPIProviderSecretInput {
  providerId: string
}

export default async function regenerateOAuthAPIProviderSecret(
  _root: any,
  {input}: {input: RegenerateOAuthAPIProviderSecretInput},
  context: GQLContext
) {
  const [providerId] = CipherId.fromClient(input.providerId)
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
    .executeTakeFirst()

  return {clientSecret: newSecret, clientId: updatedProvider!.clientId, provider: updatedProvider}
}
