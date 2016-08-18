// const CREATE_MEMBERS = '@@meeting/CREATE_MEMBERS';
// const RESET = '@@meeting/reset';
//
// const initialState = {
//   members: []
// };
//
// export default function reducer(state = initialState, action = {}) {
//   switch (action.type) {
//     case CREATE_MEMBERS:
//       return {
//         ...state,
//         members: action.payload.members
//       };
//     case RESET:
//       return initialState;
//     default:
//       return state;
//   }
// }
//
// export function createMembers(teamMembers, presence, team, user) {
//   const members = teamMembers.map((member) => {
//     // member.id is of format 'userId::teamId'
//     const [userId] = member.id.split('::');
//     return {
//       ...member,
//       isConnected: Boolean(presence.find(connection => connection.userId === userId)),
//       isFacilitator: team.activeFacilitator === member.id,
//       isSelf: user.id === userId
//     };
//   }).sort((a, b) => b.checkInOrder <= a.checkInOrder);
//
//   return {
//     type: CREATE_MEMBERS,
//     payload: {members}
//   };
// }
//
// export function reset() {
//   return {
//     type: RESET,
//     payload: {}
//   };
// }
