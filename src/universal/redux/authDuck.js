import {cashay} from 'cashay';
import jwtDecode from 'jwt-decode';
import {EventTypes} from 'redux-segment';
import ActionHTTPTransport from '../utils/ActionHTTPTransport';
import {selectSegmentProfile} from './segmentActions';

const SET_AUTH_TOKEN = '@@authToken/SET_AUTH_TOKEN';
const REMOVE_AUTH_TOKEN = '@@authToken/REMOVE_AUTH_TOKEN';

const initialState = {
  token: null,
  obj: {
    // rol and tms are not guaranteed
    aud: null,
    exp: null,
    iat: null,
    iss: null,
    sub: null,
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_AUTH_TOKEN: {
      const {obj, token} = action.payload;
      return {obj, token};
    }
    case REMOVE_AUTH_TOKEN:
      return initialState;
    default:
      return state;
  }
}

export function setAuthToken(authToken, newProfile) {
  return (dispatch, getState) => {
    const cachedProfile = selectSegmentProfile(getState());
    const profile = newProfile || cachedProfile;

    if (!authToken) {
      throw new Error('setAuthToken action created with undefined authToken');
    }
    let obj = null;
    try {
      obj = jwtDecode(authToken);
    } catch (e) {
      throw new Error(`unable to decode jwt: ${e}`);
    }

    cashay.create({httpTransport: new ActionHTTPTransport(authToken)});

    if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
      /*
       * Sentry error reporting meta-information. Raven object is set via SSR.
       * See server/Html.js for how this is initialized
       */
      Raven.setUserContext({ // eslint-disable-line no-undef
        id: obj.sub,
        email: profile.email
      });
    }
    dispatch({
      type: SET_AUTH_TOKEN,
      payload: {
        obj,
        token: authToken
      },
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: obj.sub,
            traits: {
              avatar: profile.picture,
              createdAt: profile.created_at,
              email: profile.email,
              name: profile.name
            }
          }
        }
      }
    });
  };
}

export function removeAuthToken() {
  return (dispatch) => {
    if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
      /*
       * Sentry error reporting meta-information. Raven object is set via SSR.
       * See server/Html.js for how this is initialized
       */
      Raven.setUserContext({}); // eslint-disable-line no-undef
    }
    dispatch({ type: REMOVE_AUTH_TOKEN });
  };
}
