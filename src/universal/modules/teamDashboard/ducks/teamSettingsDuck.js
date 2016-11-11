const TOGGLE_REMOVE_TEAM_MEMBER = 'teamSettings/TOGGLE_REMOVE_TEAM_MEMBER';
const TOGGLE_PROMOTE_TEAM_MEMBER = 'teamSettings/TOGGLE_PROMOTE_TEAM_MEMBER';

const initialState = {
  removeTeamMemberModal: false,
  promoteTeamMemberModal: false,
  teamMemberId: undefined,
  preferredName: undefined
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
