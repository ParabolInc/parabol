const DASH_HAS_MEETING_ALERT = 'dash/DASH_HAS_MEETING_ALERT';
const DASH_HAS_TRIAL_ALERT = 'dash/DASH_HAS_TRIAL_ALERT';

const initialState = {
  hasMeetingAlert: false,
  hasTrialAlert: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DASH_HAS_MEETING_ALERT: {
      return {
        ...state,
        hasMeetingAlert: action.payload.hasMeetingAlert
      };
    }
    case DASH_HAS_TRIAL_ALERT: {
      return {
        ...state,
        hasTrialAlert: action.payload.hasTrialAlert
      };
    }
    default:
      return state;
  }
}

export const setMeetingAlertState = (bool) => {
  const hasMeetingAlert = Boolean(bool);
  return {
    type: DASH_HAS_MEETING_ALERT,
    payload: {
      hasMeetingAlert
    }
  };
};

export const setTrialAlertState = (bool) => {
  const hasTrialAlert = Boolean(bool);
  return {
    type: DASH_HAS_TRIAL_ALERT,
    payload: {
      hasTrialAlert
    }
  };
};
