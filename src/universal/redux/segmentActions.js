import {EventTypes} from 'redux-segment';
import {cashay} from 'cashay';
import {DEFAULT_AUTH_REDUCER_NAME} from './authDuck';
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

export function selectSegmentProfile(state, authReducer = DEFAULT_AUTH_REDUCER_NAME) {
  const userId = state[authReducer].obj.sub;
  if (!userId) {
    return defaultProfile;
  }
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;

  return ({
    avatar: user.picture,
    email: user.email,
    id: user.id,
    name: user.preferredName,
  });
}

export function segmentEventIdentify() {
  return (dispatch, getState) => {
    const profile = selectSegmentProfile(getState());
    dispatch({
      type: SEGMENT_EVENT,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: profile.id,
            traits: {
              avatar: profile.picture,
              email: profile.email,
              name: profile.name
            }
          }
        }
      }
    });
  };
}

export function segmentEventTrack(event, properties, options) {
  return ({
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.track,
        eventPayload: {
          event,
          properties,
          options
        }
      }
    }
  });
}

export function segmentEventPage(name, category, properties, options) {
  return ({
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.page,
        eventPayload: {
          name,
          category,
          properties,
          options
        }
      }
    }
  });
}

export function segmentEventReset() {
  return ({
    type: SEGMENT_EVENT,
    meta: {
      analytics: {
        eventType: EventTypes.reset
      }
    }
  });
}
