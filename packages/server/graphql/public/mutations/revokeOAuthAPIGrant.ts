import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const revokeOAuthAPIGrant: MutationResolvers['revokeOAuthAPIGrant'] = async (
  _source,
  {grantId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const [id] = CipherId.fromClient(grantId)
  await getKysely().deleteFrom('OAuthAPIGrant').where('id', '=', id).execute()
  dataLoader.get('oauthAPIGrants').clear(id)
  return {userId: viewerId}
}

export default revokeOAuthAPIGrant
