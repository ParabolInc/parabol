import {InvoiceItemType, Threshold} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import getUserIdsToPause from '../../../postgres/queries/getUserIdsToPause'
import {MutationResolvers} from '../resolverTypes'

const autopauseUsers: MutationResolvers['autopauseUsers'] = async () => {
  const r = await getRethink()

  // RESOLUTION
  const activeThresh = new Date(Date.now() - Threshold.AUTO_PAUSE)
  const userIdsToPause = await getUserIdsToPause(activeThresh)

  const BATCH_SIZE = 100
  for (let i = 0; i < 1e5; i++) {
    const skip = i * BATCH_SIZE
    const userIdBatch = userIdsToPause.slice(skip, skip + BATCH_SIZE)
    if (userIdBatch.length < 1) break
    const results = (await (
      r
        .table('OrganizationUser')
        .getAll(r.args(userIdBatch), {index: 'userId'})
        .filter({removedAt: null})
        .group('userId') as any
    )('orgId').run()) as {group: string; reduction: string[]}[]
    await Promise.allSettled(
      results.map(async ({group: userId, reduction: orgIds}) => {
        try {
          return await adjustUserCount(userId, orgIds, InvoiceItemType.AUTO_PAUSE_USER)
        } catch (e) {
          console.warn(`Error adjusting user count`)
        }
        return undefined
      })
    )
  }

  return userIdsToPause.length
}

export default autopauseUsers
