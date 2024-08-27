import getKysely from '../../../postgres/getKysely'

const removeSlackAuths = async (
  userId: string,
  teamIds: string | string[],
  removeToken?: boolean
) => {
  const teamIdsArr = Array.isArray(teamIds) ? teamIds : [teamIds]
  if (teamIdsArr.length === 0) {
    return {authIds: null, error: 'No teams provided'}
  }
  const inactiveAuths = await getKysely()
    .with('RemoveNotifications', (qb) =>
      qb
        .deleteFrom('SlackNotification')
        .where('userId', '=', userId)
        .where('teamId', 'in', teamIdsArr)
    )
    .updateTable('SlackAuth')
    .set({botAccessToken: removeToken ? null : undefined, isActive: false})
    .where('teamId', 'in', teamIdsArr)
    .where('userId', '=', userId)
    .returning('id')
    .execute()
  const authIds = inactiveAuths.map(({id}) => id)
  return {authIds, error: null}
}

export default removeSlackAuths
