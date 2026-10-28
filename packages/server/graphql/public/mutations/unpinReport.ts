import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {findPinnedReportRowId} from '../../../reports/pinnedReports'
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
      const rowId = await findPinnedReportRowId(trx, orgId, pinId)
      if (!rowId) throw new GraphQLError('That report isn’t pinned here')
      await trx
        .updateTable('PinnedReport')
        .set({removedAt: sql`CURRENT_TIMESTAMP`, removedBy: viewerId})
        .where('id', '=', rowId)
        .execute()
    })
  return {orgId}
}

export default unpinReport
