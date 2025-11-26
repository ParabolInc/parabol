import {Kysely} from 'kysely'
import generateRandomString from '../../../generateRandomString'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'

interface RegenerateOAuthAPIProviderSecretInput {
  providerId: string
}

export default async function regenerateOAuthAPIProviderSecret(
  _root: unknown,
  {input}: {input: RegenerateOAuthAPIProviderSecretInput},
  context: GQLContext
) {
  const {providerId} = input
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const db = getKysely() as unknown as Kysely<DB>

  const provider = await db
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

  const newSecret = 'prbl-s-' + generateRandomString(32)

  const updatedProvider = await db
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
