import {analytics} from '../../../utils/analytics/analytics'

const sendAccountRemovedEvent = async (
  userIdToDelete: string,
  email: string,
  validReason: string
) => {
  analytics.accountRemoved({id: userIdToDelete, email}, validReason)
}

export default sendAccountRemovedEvent
