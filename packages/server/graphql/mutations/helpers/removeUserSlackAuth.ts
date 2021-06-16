import fromTeamMemberId from '../../../../client/utils/relay/fromTeamMemberId'
import getRethink from '../../../database/rethinkDriver'

const removeUserSlackAuth = async (teamMemberId: string) => {
  const r = await getRethink()
  const now = new Date()
  const {userId, teamId} = fromTeamMemberId(teamMemberId)
  const existingAuth = await r
    .table('SlackAuth')
    .getAll(userId, {index: 'userId'})
    .filter({teamId})
    .nth(0)
    .default(null)
    .run()

  if (!existingAuth) {
    const error = new Error('Auth not found')
    return {authId: null, error}
  }

  const {id: authId} = existingAuth
  await r({
    auth: r
      .table('SlackAuth')
      .get(authId)
      .update({botAccessToken: null, isActive: false, updatedAt: now}),
    notifications: r
      .table('SlackNotification')
      .getAll(teamId, {index: 'teamId'})
      .filter({userId})
      .delete()
  }).run()

  return {authId, error: null}
}

export default removeUserSlackAuth
