import {Kysely} from 'kysely'
import type {DB} from '../../../oauth/dbTypes'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

export default async function oauthAPIProvider(
  _root: unknown,
  {id}: {id: string},
  context: GQLContext
) {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const db = getKysely() as unknown as Kysely<DB>
  const provider = await db
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()

  if (!provider) return null

  // Check authorization
  if (!(await isUserOrgAdmin(viewerId, provider.organizationId, dataLoader))) {
    return null
  }

  return provider
}
