import {TEAM, PRESENCE} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: TEAM,
    string: `
    subscription($teamId: ID!) {
       team(teamId: $teamId) {
         id
         createdAt
       }
    }`,
    channelfy: variables => `meeting/${variables.teamId}`
  },
  {
    channel: PRESENCE,
    string: `
    subscription($teamId: ID!) {
      presence(teamId: $teamId) {
        id
        userId
      }
    }`,
    channelfy: variables => `presence/${variables.teamId}`
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
