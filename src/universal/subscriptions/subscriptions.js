import {
  ACTIONS,
  ACTIONS_BY_TEAMMEMBER,
  ACTIONS_BY_AGENDA,
  AGENDA,
  ARCHIVED_PROJECTS,
  INVITATIONS,
  TEAM,
  TEAM_MEMBERS,
  PRESENCE,
  PROJECTS
} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: ARCHIVED_PROJECTS,
    string: `
    subscription($teamId: ID!) {
      archivedProjects(teamId: $teamId) {
        content
        id
        isArchived
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
        createdBy
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
        agendaId
        createdAt
        createdBy
        content
        id
        isComplete
        sortOrder
        teamMemberId
        updatedAt
      }
    }`
  },
  {
    channel: ACTIONS_BY_AGENDA,
    string: `
    subscription($agendaId: ID!) {
      actionsByAgenda(agendaId: $agendaId) {
        agendaId
        createdAt
        createdBy
        content
        id
        isComplete
        sortOrder
        teamMemberId
        updatedAt
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
    channel: INVITATIONS,
    string: `
    subscription($teamId: ID!) {
      invitations(teamId: $teamId) {
        id
        email
        tokenExpiration
        updatedAt
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
        agendaId
        content
        createdAt
        createdBy
        id
        isArchived
        status
        teamMemberId
        teamSort
        updatedAt
        userSort
      }
    }`
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
    }`
  },
  {
    channel: TEAM_MEMBERS,
    string: `
    subscription($teamId: ID!) {
       teamMembers(teamId: $teamId) {
         id,
         checkInOrder,
         email,
         isNotRemoved,
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
