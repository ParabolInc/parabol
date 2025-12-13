import {selectOAuthAPIProvider} from '../../../postgres/select'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import type {QueryResolvers} from '../resolverTypes'

const oauthAPIProvider: QueryResolvers['oauthAPIProvider'] = async (
  _source,
  {id},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

  const provider = await selectOAuthAPIProvider().where('id', '=', id).executeTakeFirst()

  if (!provider || !(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
    return null
  }

  return provider
}

export default oauthAPIProvider
