const SET_ACTIVITY = 'userSettings/SET_ACTIVITY';
const CLEAR_ACTIVITY = 'userSettings/CLEAR_ACTIVITY';

export const ACTIVITY_WELCOME = 'welcome';
const ACTIVITIES = [ACTIVITY_WELCOME];


const initialState = {
  activity: null,
  nextPage: null,
};

export default function reducer(state = initialState, action = {type: ''}) {
  if (action.type.startsWith('userSettings/')) {
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
    }
  }
  return state;
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
