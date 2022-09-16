import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    // delete notifications without owners
    await r
      .table('Notification')
      .filter({userIds: [null]})
      .delete()
      .run()

    // set all to unread
    await r.table('Notification').update({status: 'UNREAD'}).run()

    //turn archived into CLICKED
    await r
      .table('Notification')
      .filter({isArchived: true})
      .replace((row) => row.merge({status: 'CLICKED'}).without('isArchived'))
      .run()

    // rename startAt to createdAt & userIds to userId
    await r
      .table('Notification')
      .replace((row) =>
        row
          .merge({
            createdAt: row('startAt'),
            userId: row('userIds').nth(0).default(null)
          })
          .without('startAt', 'userIds')
      )
      .run()

    // add evictorUserId to all kick out notifications
    await r
      .table('Notification')
      .filter({type: 'KICKED_OUT'})
      .update(
        (row) => ({
          evictorUserId: r
            .table('TeamMember')
            .getAll(row('teamId'), {index: 'teamId'})
            .filter({isLead: true})
            .nth(0)('userId')
            .default(row('userId'))
        }),
        {nonAtomic: true}
      )
      .run()

    // add archivorUserId to team archived
    await r
      .table('Notification')
      .filter({type: 'TEAM_ARCHIVED'})
      .update(
        (row) => ({
          archivorUserId: r
            .table('TeamMember')
            .getAll(row('teamId'), {index: 'teamId'})
            .filter({isLead: true})
            .nth(0)('userId')
            .default(row('userId'))
        }),
        {nonAtomic: true}
      )
      .run()

    await Promise.all([
      r.table('Notification').indexCreate('userId').run(),
      r.table('Notification').indexDrop('userIds').run(),
      r.table('Notification').indexDrop('orgId').run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    //turn CLICKED into archived
    await r
      .table('Notification')
      .filter({status: 'CLICKED'})
      .replace((row) => row.merge({isArchived: true}).without('status'))
      .run()

    // rename createdAt to startAt & userId to userIds
    await r
      .table('Notification')
      .replace((row) =>
        row
          .merge({
            startAt: row('createdAt'),
            userIds: [row('userId')]
          })
          .without('createdAt', 'userId')
      )
      .run()
    await Promise.all([
      r.table('Notification').indexCreate('userIds', {multi: true}).run(),
      r.table('Notification').indexDrop('userId').run(),
      r.table('Notification').indexCreate('orgId').run()
    ])
  } catch (e) {
    console.log(e)
  }
}
