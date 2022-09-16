import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    const getThreadIds = (row) =>
      r.args(
        r
          .table('RetroReflectionGroup')
          .getAll(row('id'), {index: 'meetingId'})
          .filter({isActive: true})('id')
          .coerceTo('array') as any
      )
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .filter((row) => row('endedAt').default(null).ne(null))
      .update(
        (row) => ({
          commentCount: r
            .table('Comment')
            .getAll(getThreadIds(row), {index: 'threadId'})
            .filter({isActive: true})
            .count()
            .default(0),
          taskCount: r
            .table('Task')
            .getAll(getThreadIds(row), {index: 'threadId'})
            .count()
            .default(0),
          topicCount: r
            .table('RetroReflectionGroup')
            .getAll(row('id'), {index: 'meetingId'})
            .filter({isActive: true})
            .count()
            .default(0),
          reflectionCount: r
            .table('RetroReflection')
            .getAll(row('id'), {index: 'meetingId'})
            .filter({isActive: true})
            .count()
            .default(0)
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .replace((row) => row.without('commentCount', 'topicCount', 'reflectionCount', 'taskCount'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
