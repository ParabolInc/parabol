import getRethink from 'server/database/rethinkDriver';
import {
  getUserId,
  requireSUOrTeamMember,
  requireWebsocket
} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import shortid from 'shortid';
import {
  CHECKIN,
  LOBBY,
  AGENDA_ITEMS,
} from 'universal/utils/constants';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import addTeam from 'server/graphql/models/Team/addTeam/addTeam';
import createFirstTeam from 'server/graphql/models/Team/createFirstTeam/createFirstTeam';
import updateTeamName from 'server/graphql/models/Team/updateTeamName/updateTeamName';
import endMeeting from 'server/graphql/models/Team/endMeeting/endMeeting';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

export default {
  moveMeeting: {
    type: GraphQLBoolean,
    description: 'Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamId to make sure the socket calling has permission'
      },
      nextPhase: {
        // http://stackoverflow.com/questions/37620012/passing-graphql-enumerated-value-type-as-argument-to-function
        type: GraphQLString,
        description: 'The desired phase for the meeting'
      },
      nextPhaseItem: {
        type: GraphQLInt,
        description: 'The item within the phase to set the meeting to'
      },
      force: {
        type: GraphQLBoolean,
        description: 'If true, execute the mutation without regard for meeting flow'
      }
    },
    async resolve(source, {force, teamId, nextPhase, nextPhaseItem}, {authToken, socket}) {
      const r = getRethink();
      // TODO: transform these console statements into configurable logger statements:
      /*
       console.log('moveMeeting()');
       console.log('teamId');
       console.log(teamId);
       console.log('nextPhase');
       console.log(nextPhase);
       console.log('nextPhaseItem');
       console.log(nextPhaseItem);
       */
      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // BAILOUT
      if (force) {
        // use this if the meeting hit an infinite redirect loop. should never occur
        await r.table('Team').get(teamId).update({
          facilitatorPhase: CHECKIN,
          facilitatorPhaseItem: 1,
          meetingPhase: CHECKIN,
          meetingPhaseItem: 1,
        });
        return true;
      }

      // VALIDATION
      const nextPhaseInfo = actionMeeting[nextPhase];
      const team = await r.table('Team').get(teamId);
      const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
      const meetingPhaseInfo = actionMeeting[meetingPhase];
      if (nextPhase) {
        if (!nextPhaseInfo) {
          throw errorObj({_error: `${nextPhase} is not a valid phase`});
        }
        if (nextPhaseInfo.items) {
          const {arrayName} = nextPhaseInfo.items;
          if (arrayName === 'members') {
            const teamMembersCount = await r.table('TeamMember')
              .getAll(teamId, {index: 'teamId'})
              .filter({isNotRemoved: true})
              .count();
            if (nextPhaseItem < 1 || nextPhaseItem > teamMembersCount) {
              throw errorObj({_error: 'We don\'t have that many team members!'});
            }
          } else if (arrayName === 'agenda') {
            const agendaItemCount = await r.table('AgendaItem')
              .getAll(teamId, {index: 'teamId'})
              .filter({isActive: true})
              .count();
            if (nextPhaseItem < 1 || nextPhaseItem > agendaItemCount) {
              throw errorObj({_error: 'We don\'t have that many agenda items!'});
            }
          }
          if (nextPhaseInfo.visitOnce && meetingPhaseInfo.index > nextPhaseInfo.index) {
            throw errorObj({_error: 'You can\'t visit first call twice!'});
          }
        } else if (nextPhaseItem) {
          throw errorObj({_error: `${nextPhase} does not have phase items, but you said ${nextPhaseItem}`});
        }
      }

      if (!nextPhaseItem && (!nextPhase || nextPhaseInfo.items)) {
        throw errorObj({_error: 'Did not receive a nextPhaseItem'});
      }

      const userId = getUserId(authToken);
      const teamMemberId = `${userId}::${teamId}`;
      if (activeFacilitator !== teamMemberId) {
        throw errorObj({_error: 'Only the facilitator can advance the meeting'});
      }

      // RESOLUTION
      const goingForwardAPhase = nextPhase && nextPhaseInfo.index > meetingPhaseInfo.index;
      const onSamePhaseWithItems = (!nextPhase || nextPhase === meetingPhase) && meetingPhaseInfo.items;

      const promises = [];
      if (facilitatorPhase === AGENDA_ITEMS) {
        const agendaIdx = actionMeeting[AGENDA_ITEMS].index;
        const markComplete = (!nextPhase && meetingPhase === AGENDA_ITEMS) ||
          (nextPhaseInfo && nextPhaseInfo.index > agendaIdx);
        if (markComplete) {
          promises.push(r.table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true})
            .orderBy('sortOrder')
            .nth(facilitatorPhaseItem - 1)
            .update({isComplete: true})
            .run());
        }
      }
      /*
       console.log('moveMeeting');
       console.log(moveMeeting);
       */

      let newMeetingPhaseItem;
      if (goingForwardAPhase) {
        newMeetingPhaseItem = nextPhaseInfo.items ? nextPhaseItem : null;
      } else if (onSamePhaseWithItems) {
        newMeetingPhaseItem = (nextPhaseItem - meetingPhaseItem === 1) ? nextPhaseItem : undefined;
      }

      const updatedState = {
        facilitatorPhase: nextPhase || undefined,
        facilitatorPhaseItem: isNaN(nextPhaseItem) ? null : nextPhaseItem,
        meetingPhase: goingForwardAPhase ? nextPhase : undefined,
        meetingPhaseItem: newMeetingPhaseItem
      };
      promises.push(r.table('Team').get(teamId).update(updatedState).run());
      await Promise.all(promises);
      // console.log('updatedState');
      // console.log(updatedState);
      // console.log(facilitatorPhase, meetingPhase)
      // console.log(facilitatorPhaseItem, meetingPhaseItem)
      // console.log('------------');
      return true;
    }
  },
  startMeeting: {
    type: GraphQLBoolean,
    description: 'Start a meeting from the lobby',
    args: {
      facilitatorId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The facilitator teamMemberId for this meeting'
      }
    },
    async resolve(source, {facilitatorId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // facilitatorId is of format 'userId::teamId'
      const [, teamId] = facilitatorId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
      if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
        throw errorObj({_error: 'facilitator is not active on that team'});
      }

      const now = new Date();
      const meetingId = shortid.generate();
      const week = getWeekOfYear(now);

      const updatedTeam = {
        checkInGreeting: makeCheckinGreeting(week),
        checkInQuestion: makeCheckinQuestion(week),
        meetingId,
        activeFacilitator: facilitatorId,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 1,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 1,
      };
      await r.table('Team').get(teamId).update(updatedTeam)
        .do(() => {
          return r.table('Meeting').insert({
            id: meetingId,
            createdAt: now,
            meetingNumber: r.table('Meeting')
              .getAll(teamId, {index: 'teamId'})
              .count()
              .add(1),
            teamId,
            teamName: r.table('Team').get(teamId)('name')
          });
        });
      return true;
    }
  },
  endMeeting,
  killMeeting: {
    type: GraphQLBoolean,
    description: 'Finish a meeting abruptly',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team that will be having the meeting'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      // reset the meeting
      await r.table('Team').get(teamId)
        .update({
          facilitatorPhase: LOBBY,
          meetingPhase: LOBBY,
          meetingId: null,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
          activeFacilitator: null
        });
      return true;
    }
  },
  addTeam,
  createFirstTeam,
  changeFacilitator: {
    type: GraphQLBoolean,
    description: 'Change a facilitator while the meeting is in progress',
    args: {
      facilitatorId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The facilitator teamMemberId for this meeting'
      }
    },
    async resolve(source, {facilitatorId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // facilitatorId is of format 'userId::teamId'
      const [, teamId] = facilitatorId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
      if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
        throw errorObj({_error: 'facilitator is not active on that team'});
      }

      // RESOLUTION
      await r.table('Team').get(teamId).update({activeFacilitator: facilitatorId});
      return true;
    }
  },
  updateTeamName
};


// The since-last-week mega query
// const updatedMeeting = await r.table('Meeting')
//   .getAll(teamId, {index: 'teamId'})
//   .orderBy(r.desc('createdAt'))
//   .limit(2)
//   .coerceTo('array')
//   .do((meetings) => {
//     // determine the oldVal baseline
//     // if this is the first meeting, diff from beginning of meeting
//     // else, diff from the end of the last meeting
//     return {
//       sinceTime: meetings.nth(1)('endedAt').default(meetings.nth(0)('createdAt')),
//       meetingId: meetings.nth(0)('id')
//     }
//   })
//   .do((res) => {
//     // create project diffs
//     return {
//       meetingId: res('meetingId'),
//       projectDiffs: r.table('Project')
//         .getAll(teamId, {index: 'teamId'})
//         .filter({isArchived: false})
//         .coerceTo('array')
//         .map((project) => {
//           // for each team project, get the old val and new val
//           return {
//             oldVal: r.table('ProjectHistory')
//               .between([project('id'), r.minval], [project('id'), res('sinceTime')], {index: 'projectIdUpdatedAt'})
//               .orderBy('projectIdUpdatedAt')
//               .coerceTo('array')
//               .nth(-1)
//               .without('id', 'projectId', 'updatedAt')
//               .default(null),
//             newVal: r.table('ProjectHistory')
//               .between([project('id'), res('sinceTime')], [project('id'), r.maxval], {index: 'projectIdUpdatedAt'})
//               .orderBy('projectIdUpdatedAt')
//               .coerceTo('array')
//               .nth(-1)
//               .without('id', 'projectId', 'updatedAt')
//               .default(null)
//           }
//         })
//         .do((fullDiffs) => {
//           // only grab the rows that have changed
//           return fullDiffs.filter((row) => row('newVal').ne(null))
//         })
//         .map((fullDiff) => {
//           return {
//             id: res('meetingId').add('::').add(fullDiff('newVal')('id')),
//             oldVal: fullDiff('oldVal'),
//             newVal: fullDiff('newVal')
//               .keys()
//               .filter((k) => {
//                 return fullDiff('oldVal').ne(null).and(fullDiff('oldVal')(k)).ne(fullDiff('newVal')(k))
//               })
//               .map((k) => [k, fullDiff('newVal')(k)])
//               .coerceTo('object')
//           }
//         })
//         .do((partialDiffs) => {
//           // if a project switch from 'active' to 'done' to 'active', remove it, too
//           return partialDiffs.filter((row) => row('newVal').ne({}))
//         })
//     }
//   })
//   .do((res) => {
//     // incorporate the newly created actions and endedAt
//     return {
//       meetingId: res('meetingId'),
//       meetingUpdates: {
//         actions: r.table('AgendaItem')
//           .getAll(teamId, {index: 'teamId'})
//           .filter({isActive: true})
//           .coerceTo('array')
//           .map((doc) => doc('id'))
//           .do((agendaItemIds) => {
//             return r.table('Action')
//               .getAll(r.args(agendaItemIds), {index: 'agendaId'})
//               .map(row => row.merge({id: res('meetingId').add('::').add(row('id'))}))
//               .pluck('id', 'content', 'teamMemberId')
//               .coerceTo('array')
//           }),
//         endedAt: now,
//         projects: res('projectDiffs'),
//         teamName: r.table('Team').get(teamId)('name'),
//         agendaItemsCompleted: r.table('AgendaItem')
//           .getAll(teamId, {index: 'teamId'})
//           .filter({isActive: true, isComplete: true})
//           .count()
//       }
//       // itemsCompleted: projectDiffs
//       //   .map(row => r.branch(row('newVal')('status').eq(DONE), 1, 0))
//       //   .reduce((left, right) => left.add(right)).default(0)
//     }
//   })
//   .do((res) => {
//     // add the updates to the meeting history
//     return r.table('Meeting').get(res('meetingId'))
//       .update(res('meetingUpdates'))
//   });


// r.db('actionDevelopment')
//   .table('Meeting')
//   .getAll('team123', {index: 'teamId'})
//   .orderBy(r.desc('createdAt'))
//   .nth(0)('id')
//   .do((meetingId) => {
//     return r.db('actionDevelopment')
//       .table('AgendaItem')
//       .getAll('team123', {index: 'teamId'})
//       .filter({isActive: true, isComplete: true})
//       .map((doc) => doc('id'))
//       .coerceTo('array')
//       .do((agendaItemIds) => {
//         return {
//             actions: r.db('actionDevelopment').table('Action')
//               .getAll(r.args(agendaItemIds), {index: 'agendaId'})
//               .map(row => row.merge({id: meetingId.add('::').add(row('id'))}))
//               .pluck('id', 'content', 'teamMemberId')
//               .coerceTo('array'),
//             agendaItemsCompleted: agendaItemIds.count(),
//             projects: r.db('actionDevelopment').table('Project')
//               .getAll(r.args(agendaItemIds), {index: 'agendaId'})
//               .map(row => row.merge({id: meetingId.add('::').add(row('id'))}))
//               .pluck('id', 'content', 'status', 'teamMemberId')
//               .coerceTo('array'),
//             teamName: r.db('actionDevelopment').table('Team').get('team123')('name'),
//           }
//       })
//   });
