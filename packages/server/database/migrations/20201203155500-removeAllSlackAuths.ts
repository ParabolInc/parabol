import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const now = new Date()
  try {
    const allSlackAuths = await r.table('SlackAuth').filter({isActive: true}).run()
    const allSlackAuthIds = allSlackAuths.map(({id}) => id)
    await r
      .table('SlackAuth')
      .getAll(r.args(allSlackAuthIds))
      .update({botAccessToken: null, isActive: false, updatedAt: now})
      .run()

    await r.table('SlackNotification').delete().run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  // noop
}
