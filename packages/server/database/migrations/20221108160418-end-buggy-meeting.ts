import {R} from 'rethinkdb-ts'

const buggyMeetingIds = ['hmcyIBcqI0', 'dqoFvbCljO']

export const up = async function (r: R) {
  const now = new Date()
  await r
    .table('NewMeeting')
    .getAll(r.args(buggyMeetingIds))
    .update({endedAt: now, commentCount: 0, storyCount: 0})
    .run()
}

export const down = async function (r: R) {
  await r
    .table('NewMeeting')
    .getAll(r.args(buggyMeetingIds))
    .replace((row) => row.without('endedAt', 'commentCount', 'storyCount'))
    .run()
}
