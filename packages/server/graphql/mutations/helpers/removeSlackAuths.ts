import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'

const removeSlackAuths = async (
  userId: string,
  teamIds: string | string[],
  removeToken?: boolean
) => {
  const r = await getRethink()
  const teamIdsArr = Array.isArray(teamIds) ? teamIds : [teamIds]
  if (teamIds.length === 0) {
    return {authIds: null, error: 'No teams provided'}
  }
  const inactiveAuths = await getKysely()
    .updateTable('SlackAuth')
    .set({botAccessToken: removeToken ? null : undefined, isActive: false})
    .where('teamId', 'in', teamIds)
    .where('userId', '=', userId)
    .returning('id')
    .execute()

  await r({
    notifications: r
      .table('SlackNotification')
      .getAll(r.args(teamIdsArr), {index: 'teamId'})
      .filter({userId})
      .delete()
  }).run()
  const authIds = inactiveAuths.map(({id}) => id)
  return {authIds, error: null}
}

export default removeSlackAuths
