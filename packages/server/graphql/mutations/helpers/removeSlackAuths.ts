import getRethink from '../../../database/rethinkDriver'

const removeSlackAuths = async (
  userId: string,
  teamIds: string | string[],
  removeToken?: boolean
) => {
  const r = await getRethink()
  const now = new Date()
  const teamIdsArr = Array.isArray(teamIds) ? teamIds : [teamIds]
  const existingAuths = await r
    .table('SlackAuth')
    .getAll(r.args(teamIdsArr), {index: 'teamId'})
    .filter({userId})
    .run()

  if (!existingAuths.length) {
    const error = new Error('Auth not found')
    return {authIds: null, error}
  }

  const authIds = existingAuths.map(({id}) => id)
  await r({
    auth: r
      .table('SlackAuth')
      .getAll(r.args(authIds))
      .update({
        botAccessToken: removeToken ? null : undefined,
        isActive: false,
        updatedAt: now
      }),
    notifications: r
      .table('SlackNotification')
      .getAll(r.args(teamIdsArr), {index: 'teamId'})
      .filter({userId})
      .delete()
  }).run()

  return {authIds, error: null}
}

export default removeSlackAuths
