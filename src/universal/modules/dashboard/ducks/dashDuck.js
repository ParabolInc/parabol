const DASH_HAS_MEETING_ALERT = 'dash/DASH_HAS_MEETING_ALERT';

const initialState = {
  hasMeetingAlert: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DASH_HAS_MEETING_ALERT: {
      return {
        ...state,
        hasMeetingAlert: action.payload.hasMeetingAlert
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
