const TOGGLE_REMOVE_TEAM_MEMBER = 'teamSettings/TOGGLE_REMOVE_TEAM_MEMBER';

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
  }
  return state;
};

export const removeTeamMemberModal = () => ({
  type: TOGGLE_REMOVE_TEAM_MEMBER
});

