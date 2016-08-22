const SET_ACTIVITY = 'action/userDashboard/settings/SET_ACTIVITY';
const CLEAR_ACTIVITY = 'action/userDashboard/settings/CLEAR_ACTIVITY';

export const ACTIVITY_WELCOME = 'welcome';
const ACTIVITIES = [ACTIVITY_WELCOME];


const initialState = {
  activity: null,
  nextPage: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_ACTIVITY: {
      const {activity, nextPage} = action.payload;
      return {
        ...state,
        activity,
        nextPage,
      };
    }
    case CLEAR_ACTIVITY:
      return {
        ...state,
        activity: null,
        nextPage: null,
      };
    default:
      return state;
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
