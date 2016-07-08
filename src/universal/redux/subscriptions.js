// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: 'meeting',
    string: `
    subscription($meetingId: ID!) {
       meeting(meetingId: $meetingId) {
         id
         createdAt
         participants {
           id
         }
       }
    }`,
    channelfy: variables => `meeting/${variables.meetingId}`
  }
];
