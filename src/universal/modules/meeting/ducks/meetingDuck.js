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
    return {
      ...member,
      isConnected: Boolean(presence.find(connection => connection.userId === member.userId)),
      isFacilitator: team.activeFacilitator === member.id,
      isSelf: user.id === member.userId
    };
  }).sort((a, b) => b.checkInOrder <= a.checkInOrder);

  return {
    type: SET_MEMBERS,
    payload: {members}
  };
}

// export function setLocalPhase() {
//   return {
//     type: REMOVE_AUTH_TOKEN,
//     payload: {}
//   };
// }
