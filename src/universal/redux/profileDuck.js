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

export const PROFILE_REDUCER_NAME = 'profile';

/**
 * @param {object} payload - an auth0 user profile
 */
export function setProfile(payload) {
  // re-map auth0 profile fields to segment profile schema:
  const segmentProfile = {
    avatar: payload.picture || payload.avatar || null,
    createdAt: payload.created_at || payload.createdAt || null,
    description: payload.preferredName,
    email: payload.email || null,
    id: payload.user_id,
    firstName: payload.given_name,
    lastName: payload.family_name,
    name: payload.name || null
  };
  Object.keys(segmentProfile).forEach((k) => {
    if (typeof segmentProfile[k] === 'undefined') {
      delete segmentProfile[k];
    }
  });

  return {
    type: SET_PROFILE,
    payload: segmentProfile
  };
}

export function clearProfile() {
  return {
    type: CLEAR_PROFILE
  };
}

export const selectProfile = (state) => state[PROFILE_REDUCER_NAME];
