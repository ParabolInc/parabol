const DASH_ALERT_PRESENCE = 'dash/DASH_ALERT_PRESENCE';

const initialState = {
  hasDashAlert: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DASH_ALERT_PRESENCE: {
      return {
        ...state,
        hasDashAlert: action.payload.hasDashAlert,
      };
    }
    default:
      return state;
  }
}

export const setDashAlertPresence = (bool) => {
  const hasDashAlert = Boolean(bool);
  return {
    type: DASH_ALERT_PRESENCE,
    payload: {
      hasDashAlert
    }
  };
};
