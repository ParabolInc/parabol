import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {findPinnedReportRowId, selectActivePinnedReports} from '../../../reports/pinnedReports'
import type {MutationResolvers} from '../resolverTypes'

const movePinnedReport: MutationResolvers['movePinnedReport'] = async (
  _source,
  {orgId, pinId, toIndex}
) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const rowId = await findPinnedReportRowId(trx, orgId, pinId)
      if (!rowId) throw new GraphQLError('That report isn’t pinned here')
      const pins = await selectActivePinnedReports(trx, orgId)
      const order = pins.map(({id}) => id).filter((id) => id !== rowId)
      order.splice(Math.max(0, Math.min(toIndex, order.length)), 0, rowId)
      for (const [idx, id] of order.entries()) {
        await trx
          .updateTable('PinnedReport')
          .set({sortOrder: idx + 1})
          .where('id', '=', id)
          .execute()
      }
    })
  return {orgId}
}

export default movePinnedReport
