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
//     // create task diffs
//     return {
//       meetingId: res('meetingId'),
//       taskDiffs: r.table('Task')
//         .getAll(teamId, {index: 'teamId'})
//         .coerceTo('array')
//         .map((task) => {
//           // for each team task, get the old val and new val
//           return {
//             oldVal: r.table('TaskHistory')
//               .between([task('id'), r.minval], [task('id'), res('sinceTime')], {index: 'taskIdUpdatedAt'})
//               .orderBy('taskIdUpdatedAt')
//               .coerceTo('array')
//               .nth(-1)
//               .without('id', 'taskId', 'updatedAt')
//               .default(null),
//             newVal: r.table('TaskHistory')
//               .between([task('id'), res('sinceTime')], [task('id'), r.maxval], {index: 'taskIdUpdatedAt'})
//               .orderBy('taskIdUpdatedAt')
//               .coerceTo('array')
//               .nth(-1)
//               .without('id', 'taskId', 'updatedAt')
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
//           // if a task switch from 'active' to 'done' to 'active', remove it, too
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
//         tasks: res('taskDiffs'),
//         teamName: r.table('Team').get(teamId)('name'),
//         agendaItemsCompleted: r.table('AgendaItem')
//           .getAll(teamId, {index: 'teamId'})
//           .filter({isActive: true, isComplete: true})
//           .count()
//       }
//       // itemsCompleted: taskDiffs
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
//             tasks: r.db('actionDevelopment').table('Task')
//               .getAll(r.args(agendaItemIds), {index: 'agendaId'})
//               .map(row => row.merge({id: meetingId.add('::').add(row('id'))}))
//               .pluck('id', 'content', 'status', 'teamMemberId')
//               .coerceTo('array'),
//             teamName: r.db('actionDevelopment').table('Team').get('team123')('name'),
//           }
//       })
//   });
