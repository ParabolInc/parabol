import {getUserId} from '../../../utils/authorization'
import type {ToggleSummaryEmailPayloadResolvers} from '../resolverTypes'

export type ToggleSummaryEmailPayloadSource = true

const ToggleSummaryEmailPayload: ToggleSummaryEmailPayloadResolvers = {
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default ToggleSummaryEmailPayload
