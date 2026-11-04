import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {fromReportKey} from '../../../reports/pinnedReports'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const rateReportQuestion: MutationResolvers['rateReportQuestion'] = async (
  _source,
  {orgId, reportQuestionId: reportQuestionKey, rating},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const reportQuestionId = fromReportKey(reportQuestionKey)
  const reportQuestion = reportQuestionId
    ? await getKysely()
        .updateTable('ReportQuestion')
        .set({rating: rating ?? null, ratedAt: rating ? sql`CURRENT_TIMESTAMP` : null})
        .where('id', '=', reportQuestionId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .where('source', '=', 'ask')
        .where('outcome', '=', 'shown')
        .returningAll()
        .executeTakeFirst()
    : undefined
  if (!reportQuestion)
    throw new GraphQLError('That isn’t a report AI made for one of your questions')
  return {reportQuestion}
}

export default rateReportQuestion
