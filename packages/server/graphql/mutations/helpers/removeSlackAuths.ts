import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import getRethink from '../../../database/rethinkDriver'

const removeSlackAuths = async (teamMemberIds: string[], removeToken: boolean) => {
  const r = await getRethink()
  const now = new Date()
  const {userId} = fromTeamMemberId(teamMemberIds[0])
  const teamIds = [] as string[]
  teamMemberIds.forEach((teamMemberId) => {
    const {teamId} = fromTeamMemberId(teamMemberId)
    teamIds.push(teamId)
  })
  const existingAuths = await r
    .table('SlackAuth')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({userId})
    .run()

  if (!existingAuths) {
    const error = new Error('Auth not found')
    return {authId: null, error}
  }

  const authIds = existingAuths.map(({id}) => id)
  await r
    .table('SlackAuth')
    .getAll(r.args(authIds))
    .update((row) => ({
      botAccessToken: r.branch(removeToken, null, row('botAccessToken')),
      isActive: false,
      updatedAt: now
    }))
    .run()

  const authId = authIds[0]
  return {authId, error: null}
}

export default removeSlackAuths
