export const TOGGLE_REMOVE_BILLING_LEADER = 'orgSettings/TOGGLE_REMOVE_BILLING_LEADER';
export const TOGGLE_LEAVE_ORG = 'orgSettings/TOGGLE_LEAVE_ORG';
export const TOGGLE_AVATAR_MODAL = 'orgSettings/TOGGLE_AVATAR_MODAL';

export const BILLING_PAGE = 'billing';
export const MEMBERS_PAGE = 'members';

const initialState = {
  removeBillingLeaderModal: false,
  leaveOrgModal: false,
  paymentModal: true,
  openModal: '',
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
      openModal: state.openModal === type ? '' : type,
      userId,
      preferredName

    };
  } else if (type === TOGGLE_LEAVE_ORG) {
    return {
      ...state,
      openModal: state.openModal === type ? '' : type,
      userId
    };
  } else if (type === TOGGLE_PAYMENT_MODAL) {
    return {
      ...state,
      openModal: state.openModal === type ? '' : type,
    }
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

export const toggleAvatarModal = () => ({
  type: TOGGLE_AVATAR_MODAL
});
