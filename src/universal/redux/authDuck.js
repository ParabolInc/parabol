const SET_AUTH_TOKEN = 'notifications/SET_AUTH_TOKEN';
const REMOVE_AUTH_TOKEN = 'notifications/REMOVE_AUTH_TOKEN';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return action.payload.authToken;
    case REMOVE_AUTH_TOKEN:
      return null;
    default:
      return state;
  }
}

export function setAuthToken(authToken) {
  return {
    type: SET_AUTH_TOKEN,
    payload: {authToken}
  };
}

export function removeAuthToken(authToken) {
  return {
    type: REMOVE_AUTH_TOKEN,
    payload: {authToken}
  };
}
