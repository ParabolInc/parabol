import {getUserId} from '../../../utils/authorization'
import type {TogglePageInvitationEmailSuccessResolvers} from '../resolverTypes'

export type TogglePageInvitationEmailSuccessSource = true

const TogglePageInvitationEmailSuccess: TogglePageInvitationEmailSuccessResolvers = {
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default TogglePageInvitationEmailSuccess
