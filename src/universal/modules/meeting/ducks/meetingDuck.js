const SET_MEMBERS = '@@meeting/SET_MEMBERS';
const SET_LOCAL_PHASE = '@@meeting/SET_LOCAL_PHASE';

const initialState = {
  members: [],
  localPhase: null,
  localPhaseItem: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_MEMBERS:
      return {
        ...state,
        members: action.payload.members
      };
    case SET_LOCAL_PHASE:
      return {
        ...state,
        localPhase: action.payload.localPhase || state.localPhase,
        localPhaseItem: action.payload.localPhaseItem || state.localPhaseItem
      };
    default:
      return state;
  }
}

export function createMembers(teamMembers, presence, team, user) {
  const members = teamMembers.map((member) => {
    // member.id is of format 'userId::teamId'
    const [userId] = member.id.split('::');
    return {
      ...member,
      isConnected: Boolean(presence.find(connection => connection.userId === userId)),
      isFacilitator: team.activeFacilitator === member.id,
      isSelf: user.id === userId
    };
  }).sort((a, b) => b.checkInOrder <= a.checkInOrder);

  return {
    type: SET_MEMBERS,
    payload: {members}
  };
}
