import SegmentIo from 'analytics-node'
import {getUserById} from '../postgres/queries/getUsersByIds'
import PROD from '../PROD'
import updateHubspot from './updateHubspot'

const {SEGMENT_WRITE_KEY} = process.env

const segmentIo = new SegmentIo(SEGMENT_WRITE_KEY || 'x', {
  flushAt: PROD ? 20 : 1,
  enable: !!SEGMENT_WRITE_KEY
}) as any
segmentIo._track = segmentIo.track
segmentIo.track = async (options: any) => {
  const {userId, event, properties: inProps} = options
  const user = options.userId ? await getUserById(options.userId) : null
  const {email, segmentId} = user ?? {}
  const properties = {...inProps, email}
  user && updateHubspot(event, user, properties)
  return (segmentIo as any)._track({
    userId,
    event,
    /*
     * Specify the Google Analytics ID for use with the Google Analytics integration
     *
     * Why do we do this? GA is a sad, old bear. Here's the story: when
     * a user new to Parabol visits our marketing website the Segment-generated
     * anonymousId is hashed to create the GA User ID. Before this change,
     * we assumed sending a identify() event that would tie the new, Parabol userId to the
     * anonymousId, but Google Analytics apparently does not support tying users together
     * in this way. When we would looked at our data, events coming from our app would
     * be tallied as "direct" rather than acquired through a known channel (e.g.
     * "Organic Search"), making it look like all these new users just dropped out of the
     * sky.
     *
     * To work around this, we specify which a UUID Segment will consistently hash
     * between our marketing site and app domains. We do this by passing in
     * additional Segment context, as seen here:
     */
    integrations: {
      'Google Analytics': {clientId: segmentId || userId}
    },
    properties
  })
}
/** @deprecated use {@link analytics} instead of directly sending events to segment */
export default segmentIo as SegmentIo
