import {EventTypes} from 'redux-segment';
import {cashay} from 'cashay';
import {getAuthQueryString, getAuthedOptions} from './getAuthedUser';

/**
 * Sometimes, we just want to track events in segment.
 */

const SEGMENT_EVENT = '@@segment/EVENT';

const defaultProfile = {
  avatar: null,
  email: null,
  id: null,
  name: null
};

export function selectSegmentProfile(state) {
  if (!state.auth || !cashay.store) { return defaultProfile; }
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;
  if (!user) { return defaultProfile; }

  return ({
    avatar: user.picture || null,
    email: user.email || null,
    id: user.id || null,
    name: user.preferredName || null
  });
}

export function segmentEventTrack(event, properties, options) {
  return (dispatch, getState) => {
    const profile = selectSegmentProfile(getState());
    const propertiesOut = Object.assign({}, profile, properties);
    const optionsOut = Object.assign({}, { context: { traits: profile } }, options);

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

export function segmentEventPage(name, category, properties, options) {
  return (dispatch, getState) => {
    const profile = selectSegmentProfile(getState());
    const propertiesOut = Object.assign({}, profile, properties);
    const optionsOut = Object.assign({}, { context: { traits: profile } }, options);

    dispatch({
      type: SEGMENT_EVENT,
      meta: {
        analytics: {
          eventType: EventTypes.page,
          eventPayload: {
            name,
            category,
            properties: propertiesOut,
            options: optionsOut
          }
        }
      }
    });
  };
}
