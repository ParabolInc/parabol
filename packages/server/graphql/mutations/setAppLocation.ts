import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import db from '../../db'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import rateLimit from '../rateLimit'
import SetAppLocationPayload from '../types/SetAppLocationPayload'

export default {
  type: new GraphQLNonNull(SetAppLocationPayload),
  description: `Share where in the app the viewer is`,
  args: {
    location: {
      type: GraphQLString,
      description: 'The location the viewer is currently at'
    }
  },
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: rateLimit({
    perMinute: 50,
    perHour: 100
  })(async (_source, {location}, {authToken, dataLoader, socketId: mutatorId}) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
    if (!viewer) {
      return {error: {message: 'Not a user'}}
    }

    // RESOLUTION
    const {lastSeenAtURL} = viewer
    const lastSeenAt = new Date()
    const data = {userId: viewerId}
    if (lastSeenAtURL !== location) {
      await db.write('User', viewerId, {lastSeenAt, lastSeenAtURL: location})
      const meetingId = lastSeenAtURL?.includes('/meet/')
        ? lastSeenAtURL.slice(6)
        : location?.includes('/meet/')
        ? location.slice(6)
        : null
      viewer.lastSeenAtURL = location
      viewer.lastSeenAt
      if (meetingId) {
        publish(SubscriptionChannel.MEETING, meetingId, 'SetAppLocationSuccess', data, subOptions)
      }
    }
    return data
  })
}
