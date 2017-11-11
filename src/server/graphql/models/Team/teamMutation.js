import addTeam from 'server/graphql/models/Team/addTeam/addTeam';
import archiveTeam from 'server/graphql/models/Team/archiveTeam/archiveTeam';
import createFirstTeam from 'server/graphql/models/Team/createFirstTeam/createFirstTeam';
import updateTeamName from 'server/graphql/models/Team/updateTeamName/updateTeamName';

export default {
  addTeam,
  createFirstTeam,
  archiveTeam,
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
