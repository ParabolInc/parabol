import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {findPinnedReportId} from '../../../reports/pinnedReports'
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
      const pinnedReportId = await findPinnedReportId(trx, orgId, pinId)
      if (!pinnedReportId) throw new GraphQLError('That report isn’t pinned here')
      await trx
        .updateTable('PinnedReport')
        .set({removedAt: sql`CURRENT_TIMESTAMP`, removedBy: viewerId})
        .where('id', '=', pinnedReportId)
        .execute()
    })
  return {orgId}
}

export default unpinReport
