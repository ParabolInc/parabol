// import test from 'ava';
// import reducer, {createMembers, reset} from '../meetingDuck';
//
// const stateTemplate = {
//   members: [],
// };
//
// const teamMembers = [
//   {
//     checkInOrder: 1,
//     id: 'userMoe::teamStooge',
//     isActive: true,
//     isCheckedIn: false,
//     isFacilitator: true,
//     isLead: true,
//     picture: 'http://stooge.com/moe.jpg',
//     preferredName: 'Moe'
//   },
//   {
//     checkInOrder: 2,
//     id: 'userLarry::teamStooge',
//     isActive: true,
//     isCheckedIn: false,
//     isFacilitator: true,
//     isLead: true,
//     picture: 'http://stooge.com/moe.jpg',
//     preferredName: 'Larry'
//   },
//   {
//     checkInOrder: 3,
//     id: 'userCurly::teamStooge',
//     isActive: true,
//     isCheckedIn: false,
//     isFacilitator: true,
//     isLead: true,
//     picture: 'http://stooge.com/moe.jpg',
//     preferredName: 'Curly'
//   }
// ];
//
// const presence = [
//   {
//     id: 'xxa',
//     userId: 'userLarry'
//   },
//   {
//     id: 'xxb',
//     userId: 'userMoe'
//   }
// ];
//
// const team = {
//   id: 'teamStooge',
//   name: 'The Three Stooges',
//   meetingId: 'abc123',
//   activeFacilitator: 'userMoe::teamStooge',
//   facilitatorPhase: 0,
//   facilitatorPhaseItem: 0,
//   meetingPhase: 0,
//   meetingPhaseItem: 0
// };
//
// const user = {
//   id: 'userMoe'
// };
//
// test('initial state', t => {
//   const initialState = reducer();
//   t.deepEqual(initialState, stateTemplate);
// });
//
// test('setMembers() updates members array', t => {
//   const initialState = reducer();
//
//   const nextState = reducer(initialState,
//     createMembers(teamMembers, presence, team, user)
//   );
//
//   t.deepEqual(nextState,
//     {
//       members: [
//         {
//           checkInOrder: 1,
//           id: 'userMoe::teamStooge',
//           isActive: true,
//           isCheckedIn: false,
//           isLead: true,
//           picture: 'http://stooge.com/moe.jpg',
//           preferredName: 'Moe',
//           isConnected: true,
//           isFacilitator: true,
//           isSelf: true
//         },
//         {
//           checkInOrder: 2,
//           id: 'userLarry::teamStooge',
//           isActive: true,
//           isCheckedIn: false,
//           isLead: true,
//           picture: 'http://stooge.com/moe.jpg',
//           preferredName: 'Larry',
//           isConnected: true,
//           isFacilitator: false,
//           isSelf: false
//         },
//         {
//           checkInOrder: 3,
//           id: 'userCurly::teamStooge',
//           isActive: true,
//           isCheckedIn: false,
//           isLead: true,
//           picture: 'http://stooge.com/moe.jpg',
//           preferredName: 'Curly',
//           isConnected: false,
//           isFacilitator: false,
//           isSelf: false
//         }
//       ]
//     }
//   );
// });
//
// test('reset() resets state', t => {
//   const state = reducer(stateTemplate,
//     createMembers(teamMembers, presence, team, user)
//   );
//   const nextState = reducer(state, reset());
//   t.deepEqual(nextState, stateTemplate);
// });
