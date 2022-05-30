import ServerAuthToken from '../../../database/types/ServerAuthToken'
import segmentIo from '../../../utils/segmentIo'

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
  segmentIo.track({
    userId: userIdToDelete,
    event: 'Account Removed',
    properties: {
      reason: validReason,
      parabolPayload: parabolPayload.data
    }
  })
}

export default sendAccountRemovedToSegment
