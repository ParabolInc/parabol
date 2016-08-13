import {AGENDA, TEAM, TEAM_MEMBERS, PRESENCE, PROJECTS} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
const defaultRehydrate = fields => fields;
export default [
  {
    channel: AGENDA,
    string: `
    subscription($teamId: ID!) {
      agenda(teamId: $teamId) {
        id
        content
        isComplete
        sort
        teamMemberId
      }
    }`,
    channelfy: variables => `agenda/${variables.teamId}`,
    rehydrate: defaultRehydrate
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
    channelfy: variables => `presence/${variables.teamId}`,
    rehydrate: defaultRehydrate
  },
  {
    channel: PROJECTS,
    string: `
    subscription($teamMemberId: ID!) {
      projects(teamMemberId: $teamMemberId) {
        content
        id
        status
        teamMemberId
        type
        updatedAt
      }
    }`,
    channelfy: variables => `projects/${variables.teamMemberId}`,
    rehydrate: fields => {
      fields.updatedAt = new Date(fields.updatedAt);
      return fields;
    }
  },
  {
    channel: TEAM,
    string: `
    subscription($teamId: ID!) {
       team(teamId: $teamId) {
         id,
         name,
         meetingId,
         activeFacilitator,
         facilitatorPhase,
         facilitatorPhaseItem,
         meetingPhase,
         meetingPhaseItem
       }
    }`,
    channelfy: variables => `team/${variables.teamId}`,
    rehydrate: defaultRehydrate
  },
  {
    channel: TEAM_MEMBERS,
    string: `
    subscription($teamId: ID!) {
       teamMembers(teamId: $teamId) {
         checkInOrder,
         id,
         isActive,
         isCheckedIn,
         isFacilitator,
         isLead,
         picture,
         preferredName
       }
    }`,
    channelfy: variables => `teamMembers/${variables.teamId}`,
    rehydrate: defaultRehydrate
  },
  {
    channel: 'user',
    string: `
    subscription($userId: ID!) {
      user(userId: $userId)
    }`,
    channelfy: variables => `user/${variables.userId}`,
    rehydrate: defaultRehydrate
  }
];
