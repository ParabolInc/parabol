import {GraphQLInt} from 'graphql'
import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import {requireSU} from 'server/utils/authorization'
import {AUTO_PAUSE_THRESH, AUTO_PAUSE_USER} from 'server/utils/serverConstants'

const autopauseUsers = {
  type: GraphQLInt,
  description:
    'automatically pause users that have been inactive for 30 days. returns the number of users paused',
  resolve: async (source, args, {authToken}) => {
    const r = getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const activeThresh = new Date(Date.now() - AUTO_PAUSE_THRESH)
    const usersToPause = await r
      .table('User')
      .filter((user) => user('lastSeenAt').le(activeThresh))
      .filter({
        inactive: false
      })
      .merge((user) => ({
        orgIds: r
          .table('OrganizationUser')
          .getAll(user('id'), {index: 'userId'})
          .filter({removedAt: null})('orgId')
      }))

    await Promise.all(
      usersToPause.map((user) => {
        try {
          return adjustUserCount(user.id, user.orgIds, AUTO_PAUSE_USER)
        } catch (e) {
          console.warn(`Error adjusting user count: ${e}`)
        }
        return undefined
      })
    )

    return usersToPause.length
  }
}

export default autopauseUsers
