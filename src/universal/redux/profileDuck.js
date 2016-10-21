const SET_PROFILE = '@@profile/SET_PROFILE';
const CLEAR_PROFILE = '@@profile/CLEAR_PROFILE';

const initialState = {
  avatar: null,
  createdAt: null,
  email: null,
  name: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROFILE:
      return Object.assign({}, state, action.payload);
    case CLEAR_PROFILE:
      return initialState;
    default:
      return state;
  }
}

export function setProfile(payload) {
  return {
    type: SET_PROFILE,
    payload
  };
}

export function clearProfile() {
  return {
    type: CLEAR_PROFILE
  };
}
