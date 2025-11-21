import {generateOAuthClientSecret} from '../../../oauth/credentials'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface RegenerateOAuthAPIProviderSecretInput {
  providerId: string
}

export default async function regenerateOAuthAPIProviderSecret(
  _root: any,
  {input}: {input: RegenerateOAuthAPIProviderSecretInput},
  context: GQLContext
) {
  const {providerId} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()

  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .select('organizationId')
    .where('id', '=', providerId)
    .executeTakeFirst()

  if (!provider) {
    throw new Error('Provider not found')
  }

  if (!(await isUserOrgAdmin(viewerId, provider.organizationId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {
      userId: viewerId
    })
  }

  const newSecret = generateOAuthClientSecret()

  const updatedProvider = await pg
    .updateTable('OAuthAPIProvider')
    .set({
      clientSecret: newSecret,
      updatedAt: new Date()
    })
    .where('id', '=', providerId)
    .returningAll()
    .executeTakeFirst()

  return {secret: newSecret, provider: updatedProvider}
}
