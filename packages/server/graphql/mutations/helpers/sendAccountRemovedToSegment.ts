import ServerAuthToken from '../../../database/types/ServerAuthToken'
import {analytics} from '../../../utils/analytics/analytics'

const sendAccountRemovedToSegment = async (
  userIdToDelete: string,
  email: string,
  validReason: string
) => {
  const executeGraphQL = require('../../executeGraphQL').default
  const parabolPayload = await executeGraphQL({
    authToken: new ServerAuthToken(), // Need admin access to run the query
    query: `
      query AccountRemoved($userId: ID!) {
        user(userId: $userId) {
          isRemoved
          email
          company {
            userCount
            activeUserCount
          }
        }
      }
    `,
    variables: {userId: userIdToDelete},
    isPrivate: true
  })
  parabolPayload.data.user.email = email
  parabolPayload.data.user.isRemoved = true
  analytics.accountRemoved(userIdToDelete, validReason)
}

export default sendAccountRemovedToSegment
