import ServerAuthToken from '../../../database/types/ServerAuthToken'
import segmentIo from '../../../utils/segmentIo'

const executeGraphQL = require('../../executeGraphQL').default

const sendAccountRemovedToSegment = async (
  userIdToDelete: string,
  email: string,
  validReason: string
) => {
  const parabolPayload = await executeGraphQL({
    authToken: new ServerAuthToken(), // Need admin access to run the query
    query: `
      query AccountRemoved($userId: ID!) {
        user(userId: $userId) {
          isRemoved
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
