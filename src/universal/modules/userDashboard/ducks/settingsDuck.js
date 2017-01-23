const SET_ACTIVITY = 'userSettings/SET_ACTIVITY';
const CLEAR_ACTIVITY = 'userSettings/CLEAR_ACTIVITY';
export const TOGGLE_USER_AVATAR_MODAL = 'userSettings/TOGGLE_USER_AVATAR_MODAL';

export const ACTIVITY_WELCOME = 'welcome';
const ACTIVITIES = [ACTIVITY_WELCOME];


const initialState = {
  activity: null,
  nextPage: null,
  openModal: ''
};

export default function reducer(state = initialState, action = {}) {
  if (!action.type.startsWith('userSettings/')) return state;
  const {type, payload} = action;
  if (type === SET_ACTIVITY) {
      const {activity, nextPage} = payload;
      return {
        ...state,
        activity,
        nextPage,
      };
    } else if (type === CLEAR_ACTIVITY) {
    return {
      ...state,
      activity: null,
      nextPage: null,
    };
  } else if (type === TOGGLE_USER_AVATAR_MODAL) {
    return {
      ...state,
      openModal: state.openModal === type ? '' : type,
    }
  }
}

export const setActivity = (activity, nextPage) => {
  if (!ACTIVITIES.includes(activity)) {
    throw new Error(`setActivity: unknown activity ${activity}`);
  }
  return {
    type: SET_ACTIVITY,
    payload: {
      activity,
      nextPage
    }
  };
};

export const setWelcomeActivity = (nextPage) => {
  return setActivity(ACTIVITY_WELCOME, nextPage);
};

export const clearActivity = () => {
  return {type: CLEAR_ACTIVITY};
};

export const toggleUserAvatarModal = () => ({
  type: TOGGLE_USER_AVATAR_MODAL
});
