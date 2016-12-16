const TOGGLE_REMOVE_BILLING_LEADER = 'teamSettings/TOGGLE_REMOVE_BILLING_LEADER';
const TOGGLE_LEAVE_ORG = 'teamSettings/TOGGLE_LEAVE_ORG';

const initialState = {
  removeBillingLeaderModal: false,
  leaveOrgModal: false,
  userId: undefined,
  preferredName: undefined,
};

export default function reducer(state = initialState, action = {}) {
  if (!action.type.startsWith('orgSettings/')) return state;
  const {type, payload} = action;
  const {userId, preferredName} = payload || {};
  if (type === TOGGLE_REMOVE_BILLING_LEADER) {
    return {
      ...state,
      removeBillingLeaderModal: !state.removeBillingLeaderModal,
      userId,
      preferredName

    };
  } else if (type === TOGGLE_LEAVE_ORG) {
    return {
      ...state,
      leaveOrgModal: !state.leaveOrgModal,
      userId
    };
  }

  return state;
}

export const toggleRemoveModal = (userId, preferredName) => ({
  type: TOGGLE_REMOVE_BILLING_LEADER,
  payload: {
    userId,
    preferredName
  }
});

export const toggleLeaveModal = (userId) => ({
  type: TOGGLE_LEAVE_ORG,
  payload: {
    userId
  }
});
