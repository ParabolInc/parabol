import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {findReportPinRowId, selectActiveReportPins} from '../../../reports/reportPins'
import type {MutationResolvers} from '../resolverTypes'

const moveReportPin: MutationResolvers['moveReportPin'] = async (
  _source,
  {orgId, pinId, toIndex}
) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const rowId = await findReportPinRowId(trx, orgId, pinId)
      if (!rowId) throw new GraphQLError('That report isn’t pinned here')
      const pins = await selectActiveReportPins(trx, orgId)
      const order = pins.map(({id}) => id).filter((id) => id !== rowId)
      order.splice(Math.max(0, Math.min(toIndex, order.length)), 0, rowId)
      for (const [idx, id] of order.entries()) {
        await trx
          .updateTable('ReportPin')
          .set({sortOrder: idx + 1})
          .where('id', '=', id)
          .execute()
      }
    })
  return {orgId}
}

export default moveReportPin
