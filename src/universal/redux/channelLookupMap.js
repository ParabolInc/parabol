export default new Map([
  [
    'meeting', `
    subscription($meetingId: ID!) {
       meeting(meetingId: $meetingId) {
         id
         createdAt
         participants {
           id
         }
       }
    }`
  ],
  // [
  //   'participants', `
  //   subscription($meetingId: ID!) {
  //     participants(meetingId: $meetingId) {
  //       id,
  //       connectionStatus
  //     }
  //   }`
  // ]
]);
