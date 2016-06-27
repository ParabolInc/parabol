const SET_AUTH_TOKEN = 'notifications/SET_AUTH_TOKEN';
const REMOVE_AUTH_TOKEN = 'notifications/REMOVE_AUTH_TOKEN';

const initialState = '';

export default function reducer(state = initialState, action) {
  if (action.type === SET_AUTH_TOKEN) {
    return action.payload.authToken;
  } else if (action.type === REMOVE_AUTH_TOKEN) {
      return '';
  } else {
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
