import {EventTypes} from 'redux-segment';
import {selectProfile} from './profileDuck';

/**
 * Sometimes, we just want to track events in segment.
 */

const SEGMENT_EVENT = '@@segment/EVENT';

export function segmentEvent(event, properties, options) {
  return (dispatch, getState) => {
    const profile = selectProfile(getState());
    const propertiesOut = Object.assign({}, profile, properties);
    const optionsOut = Object.assign({}, { context: { profile } }, options);

    dispatch({
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
    });
  };
}
