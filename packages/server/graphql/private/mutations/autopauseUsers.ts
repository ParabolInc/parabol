import {InvoiceItemType, Threshold} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import {MutationResolvers} from '../resolverTypes'

const autopauseUsers: MutationResolvers['autopauseUsers'] = async (
  _source,
  _args,
  {dataLoader}
) => {
  const pg = getKysely()
  // RESOLUTION
  const activeThresh = new Date(Date.now() - Threshold.AUTO_PAUSE)
  const usersToPause = await pg
    .selectFrom('User')
    .select('id')
    .where('lastSeenAt', '<=', activeThresh)
    .where('inactive', '=', false)
    .execute()
  const userIdsToPause = usersToPause.map(({id}) => id)

  const BATCH_SIZE = 100
  for (let i = 0; i < 1e5; i++) {
    const skip = i * BATCH_SIZE
    const userIdBatch = userIdsToPause.slice(skip, skip + BATCH_SIZE)
    if (userIdBatch.length < 1) break
    const results = await pg
      .selectFrom('OrganizationUser')
      .select(({fn}) => ['userId', fn.agg<string[]>('array_agg', ['orgId']).as('orgIds')])
      .where('userId', 'in', userIdBatch)
      .where('removedAt', 'is', null)
      .groupBy('userId')
      .execute()

    await Promise.allSettled(
      results.map(async ({userId, orgIds}) => {
        try {
          return await adjustUserCount(userId, orgIds, InvoiceItemType.AUTO_PAUSE_USER, dataLoader)
        } catch (e) {
          Logger.warn(`Error adjusting user count`)
        }
        return undefined
      })
    )
  }

  return userIdsToPause.length
}

export default autopauseUsers
