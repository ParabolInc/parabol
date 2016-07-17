import {MEETING, PRESENCE} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: MEETING,
    string: `
    subscription($meetingId: ID!) {
       meeting(meetingId: $meetingId) {
         id
         createdAt
       }
    }`,
    channelfy: variables => `meeting/${variables.meetingId}`
  },
  {
    channel: PRESENCE,
    string: `
    subscription($meetingId: ID!) {
      presence(meetingId: $meetingId) {
        id
        userId
      }
    }`,
    channelfy: variables => `presence/${variables.meetingId}`
  },
  {
    channel: 'user',
    string: `
    subscription($userId: ID!) {
      user(userId: $userId)
    }`,
    channelfy: variables => `user/${variables.userId}`
  }
];
