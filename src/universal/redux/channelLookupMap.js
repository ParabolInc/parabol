export default new Map([
  [
    'meeting', `
    subscription($meetingId: ID!) {
       meeting(meetingId: $meetingId) {
         id
       }
    }`
  ]
]);
