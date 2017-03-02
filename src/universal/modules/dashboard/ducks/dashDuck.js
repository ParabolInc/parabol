const DASH_ALERT_PRESENT = 'dash/DASH_ALERT_PRESENT';

const initialState = {
  hasDashAlert: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DASH_ALERT_PRESENT: {
      return {
        ...state,
        hasDashAlert: action.payload.hasDashAlert,
      };
    }
    default:
      return state;
  }
}

export const setDashAlertPresence = (hasDashAlert) => ({
  type: DASH_ALERT_PRESENT,
  payload: {
    hasDashAlert
  }
});
