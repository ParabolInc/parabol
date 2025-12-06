import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

export default async function oauthAPIProvider(
  _root: any,
  {id}: {id: string},
  context: GQLContext
) {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const pg = getKysely()
  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()

  if (!provider || !(await isUserOrgAdmin(viewerId, provider.organizationId, dataLoader))) {
    return null
  }

  return provider
}
