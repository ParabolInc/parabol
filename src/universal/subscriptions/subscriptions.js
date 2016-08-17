import {ACTIONS, AGENDA, TEAM, TEAM_MEMBERS, PRESENCE, PROJECTS} from 'universal/subscriptions/constants';

// For now, use an array. In the future, we can make one exclusively for the server that doesn't need to reparse the AST
const defaultRehydrate = fields => fields;
export default [
  {
    channel: ACTIONS,
    string: `
    subscription($userId: ID!) {
      actions(userId: $userId) {
        content
        id
        isComplete
        updatedAt
        sortOrder
      }
    }`,
    channelfy: variables => `actions/${variables.teamMemberId}`,
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
        content
        id
        status
        teamMemberId
        updatedAt
        userSort
        teamSort
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

//
// const inputs = [tms];
//
// const resolve = (dependency) => {
//   const projectSubs = [];
//   for (let i = 0; i < teamMembersIds.length; i++) {
//     const teamMemberId = teamMembersIds[i];
//     projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
//       op: 'projectSub',
//       key: teamMemberId,
//       variables: {teamMemberId}
//     });
//   }
//   return projectSubs;
// };
//
//
// const projectSubs = cashay.computed('projectSubs', {
//   // these are variables that are outide of the cashay ecosystem. If they change, we invalidate the cached result
//   variables: {
//     tms: state.auth.obj.tms,
//     user: cashay.query(userString)
//   },
//   // The result of this function is cached at `cashay.cachedComputations.projectSubs[key='']`
//   resolve: (variables, dependency) => {
//     const teamMemberIds = variables.tms.map(teamId => `${userId}::${teamId}`);
//     const projectSubs = [];
//     for (let i = 0; i < teamMemberIds.length; i++) {
//       const teamMemberId = teamMemberIds[i];
//       projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
//         op: 'projectSub',
//         key: teamMemberId,
//         variables: {teamMemberId},
//         // Whenever cashay.cachcedSubscriptions.projectSub[teamMemberId] is invalidated, we also invalidate the computation
//         dependency
//       });
//     }
//     return projectSubs;
//   }
// })
