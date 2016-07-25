import {TEAM, TEAM_MEMBERS, PRESENCE} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: TEAM,
    string: `
    subscription($teamId: ID!) {
       team(teamId: $teamId) {
         id,
         name,
         meetingId,
         checkInOrder,
         checkedInMembers,
         activeFacilitator,
         facilitatorPhase,
         facilitatorPhaseItem,
         meetingPhase,
         meetingPhaseItem
       }
    }`,
    channelfy: variables => `team/${variables.teamId}`
  },
  {
    channel: TEAM_MEMBERS,
    string: `
    subscription($teamId: ID!) {
       teamMembers(teamId: $teamId) {
         id,
         isActive,
         preferredName
         picture
       }
    }`,
    channelfy: variables => `teamMembers/${variables.teamId}`
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
