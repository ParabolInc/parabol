const TOGGLE_REMOVE_TEAM_MEMBER = 'teamSettings/TOGGLE_REMOVE_TEAM_MEMBER';
const TOGGLE_PROMOTE_TEAM_MEMBER = 'teamSettings/TOGGLE_PROMOTE_TEAM_MEMBER';

const initialState = {
  removeTeamMemberModal: false,
};

export default function reducer(state = initialState, action = {}) {
  if (!action.type.startsWith('teamSettings/')) return state;
  const {type} = action;
  if (type === TOGGLE_REMOVE_TEAM_MEMBER) {
    return {
      ...state,
      removeTeamMemberModal: !state.removeTeamMemberModal
    };
  } else if (type === TOGGLE_PROMOTE_TEAM_MEMBER) {
    return {
      ...state,
      promoteTeamMemberModal: !state.promoteTeamMemberModal
    }
  }
  return state;
};

export const toggleRemoveModal = () => ({
  type: TOGGLE_REMOVE_TEAM_MEMBER
});

export const togglePromoteModal = () => ({
  type: TOGGLE_PROMOTE_TEAM_MEMBER
});
