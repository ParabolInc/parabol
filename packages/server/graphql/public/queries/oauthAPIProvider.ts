import {selectOAuthAPIProvider} from '../../../postgres/select'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {QueryResolvers} from '../resolverTypes'

const oauthAPIProvider: QueryResolvers['oauthAPIProvider'] = async (
  _source,
  {id},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

  const [providerId] = CipherId.fromClient(id)
  const provider = await selectOAuthAPIProvider().where('id', '=', providerId).executeTakeFirst()

  if (!provider || !(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
    return null
  }

  return provider
}

export default oauthAPIProvider
