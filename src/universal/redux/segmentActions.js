import {EventTypes} from 'redux-segment';

/**
 * Sometimes, we just want to track events in segment.
 */

const SEGMENT_EVENT = '@@segment/EVENT';

export function segmentEvent(event, properties, options) {
  // always expose user traits:
  const traits = window.analytics && window.analytics.user().traits();
  const propertiesOut = Object.assign({}, traits, properties);
  const optionsOut = Object.assign({}, { context: { traits } }, options);

  return {
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.track,
        eventPayload: {
          event,
          properties: propertiesOut,
          options: optionsOut
        }
      }
    }
  };
}
