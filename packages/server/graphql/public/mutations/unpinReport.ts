import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {findReportPinRowId} from '../../../reports/reportPins'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const unpinReport: MutationResolvers['unpinReport'] = async (
  _source,
  {orgId, pinId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const rowId = await findReportPinRowId(trx, orgId, pinId)
      if (!rowId) throw new GraphQLError('That report isn’t pinned here')
      await trx
        .updateTable('ReportPin')
        .set({removedAt: sql`CURRENT_TIMESTAMP`, removedBy: viewerId})
        .where('id', '=', rowId)
        .execute()
    })
  return {orgId}
}

export default unpinReport
