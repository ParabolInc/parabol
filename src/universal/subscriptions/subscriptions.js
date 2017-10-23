import {
  AGENDA,
  AGENDA_PROJECTS,
  ARCHIVED_PROJECTS,
  INVITATIONS,
  ORG_APPROVALS,
  PROJECTS,
  TEAM,
  TEAM_MEMBERS
} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
export default [
  {
    channel: AGENDA_PROJECTS,
    string: `
    subscription($agendaId: ID!) {
      agendaProjects(agendaId: $agendaId) {
        id
        integration {
          service
          nameWithOwner
          issueNumber
        }
        agendaId
        content
        createdAt
        createdBy
        status
        tags
        teamMemberId
        updatedAt
      }
    }`
  },
  {
    channel: ARCHIVED_PROJECTS,
    string: `
    subscription($teamMemberId: ID!) {
      archivedProjects(teamMemberId: $teamMemberId) {
        content
        createdAt
        id
        integration {
          service
          nameWithOwner
          issueNumber
        }
        status
        tags
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
    channel: ORG_APPROVALS,
    string: `
    subscription($teamId: ID!) {
      orgApprovals(teamId: $teamId) {
        id
        createdAt
        email
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
        integration {
          service
          nameWithOwner
          issueNumber
        }
        status
        tags
        teamMemberId
        sortOrder
        updatedAt
      }
    }`
  },
  {
    channel: TEAM,
    string: `
    subscription($teamId: ID!) {
       team(teamId: $teamId) {
         checkInGreeting {
           content,
           language
         },
         checkInQuestion,
         id,
         isArchived,
         isPaid,
         name,
         meetingId,
         orgId,
         activeFacilitator,
         facilitatorPhase,
         facilitatorPhaseItem,
         meetingPhase,
         meetingPhaseItem
         tier
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
         hideAgenda,
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
      user(userId: $userId) {
        id
        notificationFlags
      }
    }`
  }
];
