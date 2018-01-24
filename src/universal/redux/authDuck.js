import jwtDecode from 'jwt-decode';
import raven from 'raven-js';
import {segmentEventIdentify, segmentEventReset} from 'universal/redux/segmentActions';

const SET_AUTH_TOKEN = '@@authToken/SET_AUTH_TOKEN';
const REMOVE_AUTH_TOKEN = '@@authToken/REMOVE_AUTH_TOKEN';
const SET_NEXT_URL = '@@authToken/SET_NEXT_URL';
const UNSET_NEXT_URL = '@@authToken/UNSET_NEXT_URL';

export const DEFAULT_AUTH_REDUCER_NAME = 'auth';

const initialState = {
  // next URL to navigate to after authenticating:
  nextUrl: null,
  // parsed jwt token:
  obj: {
    // nextUrl, rol, and tms are not guaranteed
    aud: null,
    exp: null,
    iat: null,
    iss: null,
    sub: null
  },
  // Raw jwt token:
  token: null
};

export default function reducer(state = initialState, action = {type: ''}) {
  switch (action.type) {
    case SET_AUTH_TOKEN: {
      const {obj, token} = action.payload;
      return {
        ...state,
        obj,
        token
      };
    }
    case REMOVE_AUTH_TOKEN: {
      const {nextUrl} = state;
      return {
        ...initialState,
        nextUrl
      };
    }
    case SET_NEXT_URL: {
      const {nextUrl} = action.payload;
      return {
        ...state,
        nextUrl
      };
    }
    case UNSET_NEXT_URL: {
      const {obj, token} = state;
      return {
        ...initialState,
        obj,
        token
      };
    }
    default:
      return state;
  }
}

export function setAuthToken(authToken, user) {
  return (dispatch) => {
    if (!authToken) {
      throw new Error('setAuthToken action created with undefined authToken');
    }
    let obj = null;
    try {
      obj = jwtDecode(authToken);
    } catch (e) {
      throw new Error(`unable to decode jwt: ${e}`);
    }

    // user is not present if triggered by the SocketAuthEngine, which isn't an event we care about
    if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__ && user) {
      /*
       * Sentry error reporting meta-information. Raven object is set via SSR.
       * See server/Html.js for how this is initialized
       */
      raven.setUserContext({
        id: obj.sub,
        email: user.email
      });
    }
    dispatch({
      type: SET_AUTH_TOKEN,
      payload: {
        obj,
        token: authToken
      }
    });
    if (user) {
      dispatch(segmentEventIdentify(user));
    }
  };
}

export function removeAuthToken() {
  return (dispatch) => {
    if (typeof __PRODUCTION__ !== 'undefined' && __PRODUCTION__) {
      /*
       * Sentry error reporting meta-information. Raven object is set via SSR.
       * See server/Html.js for how this is initialized
       */
      raven.setUserContext({});
    }
    dispatch({type: REMOVE_AUTH_TOKEN});
    dispatch(segmentEventReset());
  };
}

export function setNextUrl(nextUrl) {
  return (dispatch) => {
    dispatch({
      type: SET_NEXT_URL,
      payload: {nextUrl}
    });
  };
}

export function unsetNextUrl() {
  return (dispatch) => {
    dispatch({type: UNSET_NEXT_URL});
  };
}
