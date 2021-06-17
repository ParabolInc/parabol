import getRethink from '../../../database/rethinkDriver'

const removeUserSlackAuth = async (userId: string, teamId: string, removeToken: boolean) => {
  const r = await getRethink()
  const now = new Date()
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
  await r
    .table('SlackAuth')
    .get(authId)
    .update((row) => ({
      botAccessToken: r.branch(removeToken, null, row('botAccessToken')),
      isActive: false,
      updatedAt: now
    }))
    .run()

  return {authId, error: null}
}

export default removeUserSlackAuth
