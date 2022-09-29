import {getUserId} from '../../../utils/authorization'
import {ToggleSummaryEmailSuccessResolvers} from '../resolverTypes'

export type ToggleSummaryEmailSuccessSource = {}

const ToggleSummaryEmailSuccess: ToggleSummaryEmailSuccessResolvers = {
  user: async (_src, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default ToggleSummaryEmailSuccess
