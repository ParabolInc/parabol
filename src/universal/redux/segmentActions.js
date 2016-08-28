import {EventTypes} from 'redux-segment';

/**
 * Sometimes, we just want to track events in segment.
 */

const SEGMENT_EVENT = '@@segment/EVENT';

export function segmentEvent(event, properties) {
  return {
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.track,
        eventPayload: {
          event,
          properties
        }
      }
    }
  };
}
