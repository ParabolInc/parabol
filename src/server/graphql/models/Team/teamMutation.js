import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireAuth, requireSUOrTeamMember, requireWebsocket} from '../authorization';
import {updatedOrOriginal, errorObj} from '../utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} from 'graphql';
import {CreateTeamInput, UpdateTeamInput, Team} from './teamSchema';
import shortid from 'shortid';
import {
  CHECKIN,
  DONE,
  LOBBY,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
  SUMMARY,
  phaseArray,
  phaseOrder
} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import tmsSignToken from 'server/graphql/models/tmsSignToken';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';

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
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      if (nextPhase && !phaseArray.includes(nextPhase)) {
        throw errorObj({_error: `${nextPhase} is not a valid phase`});
      }

      if (force) {
        // use this if the meeting hit an infinite redirect loop. should never occur
        await r.table('Team').get(teamId).update({
          facilitatorPhase: nextPhase,
          facilitatorPhaseItem: nextPhaseItem,
          meetingPhase: nextPhase,
          meetingPhaseItem: nextPhaseItem,
        });
        return true;
      }

      const team = await r.table('Team').get(teamId);
      const {activeFacilitator, facilitatorPhase, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
      if (nextPhase === CHECKIN || nextPhase === UPDATES) {
        const teamMembersCount = await r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isActive: true})
          .count();
        if (nextPhaseItem < 1 || nextPhaseItem > teamMembersCount) {
          throw errorObj({_error: 'We don\'t have that many team members!'});
        }
      } else if (nextPhase === AGENDA_ITEMS) {
        const agendaItemCount = await r.table('AgendaItem')
          .getAll(teamId, {index: 'teamId'})
          .filter({isActive: true})
          .count();
        if (nextPhaseItem < 1 || nextPhaseItem > agendaItemCount) {
          throw errorObj({_error: 'We don\'t have that many agenda items!'});
        }
      } else if (nextPhase === FIRST_CALL && phaseOrder(meetingPhase) > phaseOrder(FIRST_CALL)) {
        throw errorObj({_error: 'You can\'t visit first call twice!'});
      } else if (nextPhase && nextPhaseItem) {
        throw errorObj({_error: `${nextPhase} does not have phase items, but you said ${nextPhaseItem}`});
      }

      const userId = getUserId(authToken);
      const teamMemberId = `${userId}::${teamId}`;
      /*
       console.log('team');
       console.log(JSON.stringify(team));
       */
      if (activeFacilitator !== teamMemberId) {
        throw errorObj({_error: 'Only the facilitator can advance the meeting'});
      }
      const isSynced = facilitatorPhase === meetingPhase && facilitatorPhaseItem === meetingPhaseItem;
      let incrementsProgress;
      if (phaseOrder(nextPhase) - phaseOrder(meetingPhase) === 1) {
        // console.log('phaseOrder increments progress');
        // meeting phase has progressed forward:
        incrementsProgress = true;
      } else if (typeof nextPhase === 'undefined' &&
        meetingPhase === CHECKIN || meetingPhase === UPDATES || meetingPhase === AGENDA_ITEMS) {
        // console.log('phaseItem increments progress');
        // same phase, and meeting phase item has incremented forward:
        incrementsProgress = nextPhaseItem - meetingPhaseItem === 1;
      } else if (meetingPhase === FIRST_CALL && nextPhase === LAST_CALL) {
        const agendaItemCount = await r.table('AgendaItem')
          .getAll(teamId, {index: 'teamId'})
          .filter({isActive: true})
          .count();
        incrementsProgress = agendaItemCount === 0;
      }
      const moveMeeting = isSynced && incrementsProgress;
      if (facilitatorPhase === AGENDA_ITEMS) {
        if (moveMeeting || phaseOrder(meetingPhase) > phaseOrder(AGENDA_ITEMS)) {
          await r.table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true})
            .orderBy('sortOrder')
            .nth(facilitatorPhaseItem - 1)
            .update({isComplete: true});
        }
      }
      /*
       console.log('moveMeeting');
       console.log(moveMeeting);
       */

      const updatedState = {
        facilitatorPhaseItem: nextPhaseItem,
      };
      if (moveMeeting) {
        updatedState.meetingPhaseItem = nextPhaseItem;
      }
      if (nextPhase) {
        updatedState.facilitatorPhase = nextPhase;
        if (moveMeeting) {
          updatedState.meetingPhase = nextPhase;
        }
      }
      await r.table('Team').get(teamId).update(updatedState);
      /*
       console.log('updatedState');
       console.log(updatedState);
       console.log('------------');
       */
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
      // facilitatorId is of format 'userId::teamId'
      const [, teamId] = facilitatorId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
      if (!facilitatorMembership || !facilitatorMembership.isActive) {
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
          return r.table('Meeting').getAll(teamId, {index: 'teamId'}).count();
        })
        .do((meetingCount) => {
          return r.table('Meeting').insert({
            id: meetingId,
            createdAt: now,
            meetingNumber: meetingCount.add(1),
            teamId,
            teamName: r.table('Team').get(teamId)('name')
          });
        });
      return true;
    }
  },
  endMeeting: {
    type: GraphQLBoolean,
    description: 'Finish a meeting abruptly',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team that will be having the meeting'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      await r.table('Meeting')
        .getAll(teamId, {index: 'teamId'})
        .orderBy(r.desc('createdAt'))
        .nth(0)('id')
        .do((meetingId) => ({
          meetingId,
          meetingUpdates: r.table('AgendaItem')
            .getAll(teamId, {index: 'teamId'})
            .filter({isActive: true, isComplete: true})
            .map((doc) => doc('id'))
            .coerceTo('array')
            .do((agendaItemIds) => {
              return {
                actions: r.table('Action')
                  .getAll(r.args(agendaItemIds), {index: 'agendaId'})
                  .map(row => row.merge({id: meetingId.add('::').add(row('id'))}))
                  .pluck('id', 'content', 'teamMemberId')
                  .coerceTo('array'),
                agendaItemsCompleted: agendaItemIds.count(),
                projects: r.table('Project')
                  .getAll(r.args(agendaItemIds), {index: 'agendaId'})
                  .map(row => row.merge({id: meetingId.add('::').add(row('id'))}))
                  .pluck('id', 'content', 'status', 'teamMemberId')
                  .coerceTo('array')
              };
            })
        }))
        .do((res) => {
          return r.table('Meeting').get(res('meetingId'))
            .update({
              actions: res('meetingUpdates')('actions').default([]),
              agendaItemsCompleted: res('meetingUpdates')('agendaItemsCompleted').default(0),
              endedAt: now,
              successExpression: makeSuccessExpression(),
              successStatement: makeSuccessStatement(),
              invitees: r.table('TeamMember')
                .getAll(teamId, {index: 'teamId'})
                .filter({isActive: true})
                .coerceTo('array')
                .map((teamMember) => ({
                  id: teamMember('id'),
                  present: r.branch(teamMember('isCheckedIn').eq(true), true, false)
                })),
              projects: res('meetingUpdates')('projects').default([]),

            }, {nonAtomic: true});
        });

      // send to summary
      await r.table('Team').get(teamId)
        .update({
          facilitatorPhase: SUMMARY,
          meetingPhase: SUMMARY,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
        });

      // reset the meeting
      await r.table('Team').get(teamId)
        .update({
          facilitatorPhase: LOBBY,
          meetingPhase: LOBBY,
          meetingId: null,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
          activeFacilitator: null
        })
        .do(() => {
          // flag agenda items as inactive (more or less deleted)
          return r.table('AgendaItem').getAll(teamId, {index: 'teamId'})
            .update({
              isActive: false
            });
        })
        .do(() => {
          // archive projects that are DONE
          return r.table('Project').getAll(teamId, {index: 'teamId'})
            .filter({status: DONE})
            .update({
              isArchived: true
            });
        })
        .do(() => {
          // shuffle the teamMember check in order, uncheck them in
          return r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .sample(100000)
            .coerceTo('array')
            .do((arr) => arr.forEach((doc) => {
              return r.table('TeamMember').get(doc('id'))
                  .update({
                    checkInOrder: arr.offsetsOf(doc).nth(0),
                    isCheckedIn: null
                  });
            })
            );
        });
      return true;
    }
  },
  createTeam: {
    // return the new JWT that has the new tms field
    type: GraphQLID,
    description: 'Create a new team and add the first team member',
    args: {
      newTeam: {
        type: new GraphQLNonNull(CreateTeamInput),
        description: 'The new team object with exactly 1 team member'
      }
    },
    async resolve(source, {newTeam}, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      if (newTeam.id.length > 10 || newTeam.id.indexOf('::') !== -1) {
        throw errorObj({_error: 'Bad id'});
      }
      const teamMemberId = `${userId}::${newTeam.id}`;

      const verifiedLeader = {
        id: teamMemberId,
        isActive: true,
        isLead: true,
        isFacilitator: true,
        checkInOrder: 0,
        teamId: newTeam.id,
        userId
      };

      const verifiedTeam = {
        ...newTeam,
        facilitatorPhase: LOBBY,
        meetingPhase: LOBBY,
        meetingId: null,
        facilitatorPhaseItem: null,
        meetingPhaseItem: null,
        activeFacilitator: null
      };

      const dbTransaction = r.table('User')
        .get(userId)
        .do((user) =>
          r.table('TeamMember').insert({
            ...verifiedLeader,
            // pull in picture and preferredName from user profile:
            picture: user('picture').default(''),
            preferredName: user('preferredName').default('')
          })
        )
        .do(() =>
          r.table('Team').insert(verifiedTeam)
        );

      const oldtms = authToken.tms || [];
      const tms = oldtms.concat(newTeam.id);
      const dbPromises = [
        dbTransaction,
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      ];
      await Promise.all(dbPromises);
      return tmsSignToken(authToken, tms);
      // TODO: trigger welcome email
    }
  },
  updateTeamName: {
    type: Team,
    args: {
      updatedTeam: {
        type: new GraphQLNonNull(UpdateTeamInput),
        description: 'The input object containing the teamId and any modified fields'
      }
    },
    async resolve(source, {updatedTeam}, {authToken}) {
      const r = getRethink();
      const {id, name} = updatedTeam;
      requireSUOrTeamMember(authToken, id);
      const teamFromDB = await r.table('Team').get(id).update({name}, {returnChanges: true});
      // TODO think hard about if we can pluck only the changed values (in this case, name)
      return updatedOrOriginal(teamFromDB, updatedTeam);
    }
  }
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
