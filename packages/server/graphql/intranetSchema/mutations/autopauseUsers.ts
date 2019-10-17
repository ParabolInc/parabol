import {GraphQLInt} from 'graphql'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {InvoiceItemType, Threshold} from 'parabol-client/types/constEnums'

const autopauseUsers = {
  type: GraphQLInt,
  description:
    'automatically pause users that have been inactive for 30 days. returns the number of users paused',
  resolve: async (_source, _args, {authToken}) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const activeThresh = new Date(Date.now() - Threshold.AUTO_PAUSE)
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
          .coerceTo('array')
      }))
      .run()

    await Promise.all(
      usersToPause.map((user) => {
        try {
          return adjustUserCount(user.id, user.orgIds, InvoiceItemType.AUTO_PAUSE_USER)
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
