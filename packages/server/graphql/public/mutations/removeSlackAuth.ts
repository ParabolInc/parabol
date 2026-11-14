import {getUserId} from '../../../utils/authorization'
import removeSlackAuths from '../../mutations/helpers/removeSlackAuths'
import type {MutationResolvers} from '../resolverTypes'

const removeSlackAuth: MutationResolvers['removeSlackAuth'] = async (
  _source,
  {teamId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const res = await removeSlackAuths(viewerId, teamId, true)
  if (!res.authIds) {
    return {error: {message: res.error ?? 'Failed to remove Slack auth'}}
  }
  const authId = res.authIds[0]

  return {authId, teamId, userId: viewerId}
}

export default removeSlackAuth
