import {getUserId} from '../../../utils/authorization'
import type {TogglePageInvitationEmailPayloadResolvers} from '../resolverTypes'

export type TogglePageInvitationEmailPayloadSource = true

const TogglePageInvitationEmailPayload: TogglePageInvitationEmailPayloadResolvers = {
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default TogglePageInvitationEmailPayload
