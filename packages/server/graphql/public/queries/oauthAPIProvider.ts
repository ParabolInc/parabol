import {selectOAuthAPIProvider} from '../../../postgres/select'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

export default async function oauthAPIProvider(
  _root: any,
  {id}: {id: string},
  context: GQLContext
) {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  const provider = await selectOAuthAPIProvider().where('id', '=', id).executeTakeFirst()

  if (!provider || !(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
    return null
  }

  return provider
}
