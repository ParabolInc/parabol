const TOGGLE_REMOVE_TEAM_MEMBER = 'teamSettings/TOGGLE_REMOVE_TEAM_MEMBER';
const TOGGLE_PROMOTE_TEAM_MEMBER = 'teamSettings/TOGGLE_PROMOTE_TEAM_MEMBER';
const TOGGLE_LEAVE_TEAM = 'teamSettings/TOGGLE_LEAVE_TEAM';

const initialState = {
  removeTeamMemberModal: false,
  promoteTeamMemberModal: false,
  leaveTeamModal: false,
  teamMemberId: undefined,
  preferredName: undefined,
  teamLead: undefined
};

export default function reducer(state = initialState, action = {}) {
  if (!action.type.startsWith('teamSettings/')) return state;
  const {type, payload} = action;
  const {teamMemberId, preferredName} = payload || {};
  if (type === TOGGLE_REMOVE_TEAM_MEMBER) {
    return {
      ...state,
      removeTeamMemberModal: !state.removeTeamMemberModal,
      teamMemberId,
      preferredName

    };
  } else if (type === TOGGLE_PROMOTE_TEAM_MEMBER) {
    return {
      ...state,
      promoteTeamMemberModal: !state.promoteTeamMemberModal,
      teamMemberId,
      preferredName
    }
  } else if (type === TOGGLE_LEAVE_TEAM) {
  return {
    ...state,
    leaveTeamModal: !state.leaveTeamModal,
    teamMemberId
  }
}

  return state;
};

export const toggleRemoveModal = (teamMemberId, preferredName) => ({
  type: TOGGLE_REMOVE_TEAM_MEMBER,
  payload: {
    teamMemberId,
    preferredName
  }
});

export const togglePromoteModal = (teamMemberId, preferredName) => ({
  type: TOGGLE_PROMOTE_TEAM_MEMBER,
  payload: {
    teamMemberId,
    preferredName
  }
});

export const toggleLeaveModal = (teamMemberId) => ({
  type: TOGGLE_LEAVE_TEAM,
  payload: {
    teamMemberId
  }
});
