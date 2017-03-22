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
  createdAt: null,
  email: null,
  id: null,
  name: null
};

export function selectSegmentTraits(state, authReducer = DEFAULT_AUTH_REDUCER_NAME) {
  const userId = state[authReducer].obj.sub;
  if (!userId) {
    return defaultProfile;
  }
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;

  return ({
    avatar: user.picture,
    createdAt: isNaN(user.createdAt.getTime()) ? null : user.createdAt,
    email: user.email,
    id: user.id,
    name: user.preferredName,
  });
}

export function segmentEventIdentify(authReducer = DEFAULT_AUTH_REDUCER_NAME) {
  return (dispatch, getState) => {
    const traits = selectSegmentTraits(getState(), authReducer);
    dispatch({
      type: SEGMENT_EVENT,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: traits.id,
            traits
          }
        }
      }
    });
  };
}

export function segmentEventTrack(event, properties, options, authReducer = DEFAULT_AUTH_REDUCER_NAME) {
  return (dispatch, getState) => {
    const traits = selectSegmentTraits(getState(), authReducer);
    const propertiesOut = Object.assign({}, {traits}, properties);
    const optionsOut = Object.assign({}, {context: {traits}}, options);

    dispatch({ type: SEGMENT_EVENT,
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

export function segmentEventPage(name, category, properties, options, authReducer = DEFAULT_AUTH_REDUCER_NAME) {
  return (dispatch, getState) => {
    const traits = selectSegmentTraits(getState(), authReducer);
    const propertiesOut = Object.assign({}, {traits}, properties);
    const optionsOut = Object.assign({}, {context: {traits}}, options);

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
