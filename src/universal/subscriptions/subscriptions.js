import {
  ACTIONS,
  ACTIONS_BY_TEAMMEMBER,
  ACTIONS_BY_AGENDA,
  AGENDA,
  ARCHIVED_PROJECTS_DIFF,
  TEAMS,
  TEAM_MEMBERS,
  PRESENCE,
  PROJECTS
} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: ARCHIVED_PROJECTS_DIFF,
    string: `
    subscription($teamId: ID!) {
      archivedProjectsDiff(teamId: $teamId) {
        id
        content
        status
        teamMemberId
        updatedAt
      }
    }`
  },
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
    }`
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
    }`
  },
  {
    channel: ACTIONS_BY_AGENDA,
    string: `
    subscription($agendaId: ID!) {
      actionsByAgenda(agendaId: $agendaId) {
        id
        teamMemberId
        content
        isComplete
        createdAt
        updatedAt
        sortOrder
        agendaId
      }
    }`
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
    }`
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
    }`
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
    }`
  },
  {
    channel: TEAMS,
    string: `
    subscription {
       teams {
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
    }`
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
    }`
  },
  {
    channel: 'user',
    string: `
    subscription($userId: ID!) {
      user(userId: $userId)
    }`
  }
];
