import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {fromReportKey} from '../../../reports/pinnedReports'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

// A rating is added, never changed, so what each question got stays even after the person changes their mind
const rateReportQuestion: MutationResolvers['rateReportQuestion'] = async (
  _source,
  {orgId, reportQuestionId: reportQuestionKey, rating},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const reportQuestionId = fromReportKey(reportQuestionKey)
  const pg = getKysely()
  const reportQuestion = reportQuestionId
    ? await pg
        .selectFrom('ReportQuestion')
        .selectAll()
        .where('id', '=', reportQuestionId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .where('source', '=', 'ask')
        .where('outcome', '=', 'shown')
        .executeTakeFirst()
    : undefined
  if (!reportQuestion?.question || !reportQuestion.spec) {
    throw new GraphQLError('That isn’t a report AI made for one of your questions', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  const {id, question, title, aiSpec, spec} = reportQuestion
  await pg
    .insertInto('ReportQuestionRating')
    .values({
      reportQuestionId: id,
      userId: viewerId,
      orgId,
      question,
      title,
      aiSpec: aiSpec === null ? null : JSON.stringify(aiSpec),
      spec: JSON.stringify(spec),
      rating: rating ?? null
    })
    .execute()
  dataLoader.get('reportQuestionRatings').clear(id)
  return {reportQuestion}
}

export default rateReportQuestion
