import {
  ACTIONS,
  ACTIONS_BY_TEAMMEMBER,
  AGENDA,
  TEAM,
  TEAM_MEMBERS,
  PRESENCE,
  PROJECTS
} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
const defaultRehydrate = fields => fields;
export default [
  {
    channel: ACTIONS,
    string: `
    subscription($userId: ID!) {
      actions(userId: $userId) {
        id
        content
        isComplete
        updatedAt
        sortOrder
        agendaId
      }
    }`,
    channelfy: variables => `actions/${variables.userId}`,
    rehydrate: fields => {
      fields.updatedAt = new Date(fields.updatedAt);
      return fields;
    }
  },
  {
    channel: ACTIONS_BY_TEAMMEMBER,
    string: `
    subscription($teamMemberId: ID!) {
      actionsByTeamMember(teamMemberId: $teamMemberId) {
        id
        teamMemberId
        content
        isComplete
        createdAt
        updatedAt
        sortOrder
        agendaId
      }
    }`,
    channelfy: variables => `actionsByTeamMember/${variables.teamMemberId}`,
    rehydrate: fields => {
      fields.updatedAt = new Date(fields.updatedAt);
      return fields;
    }
  },
  {
    channel: AGENDA,
    string: `
    subscription($teamId: ID!) {
      agenda(teamId: $teamId) {
        id
        content
        isComplete
        sortOrder
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
        editing
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
        id
        content
        status
        teamMemberId
        createdAt
        updatedAt
        userSort
        teamSort
        agendaId
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
         checkInGreeting,
         checkInQuestion,
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
