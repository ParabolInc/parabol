const NOTIFICATION_BAR_PRESENT = 'notifications/NOTIFICATION_BAR_PRESENT';

const initialState = {
  hasNotificationBar: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case NOTIFICATION_BAR_PRESENT: {
      return {
        ...state,
        hasNotificationBar: action.payload.hasNotificationBar,
      };
    }
    default:
      return state;
  }
}

export const notificationBarPresent = (hasNotificationBar) => ({
  type: NOTIFICATION_BAR_PRESENT,
  payload: {
    hasNotificationBar
  }
});
