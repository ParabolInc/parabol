import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import recordReportQuestion from '../../../reports/recordReportQuestion'
import selectPopularReportQuestions from '../../../reports/selectPopularReportQuestions'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const startReportQuestion: MutationResolvers['startReportQuestion'] = async (
  _source,
  {orgId, popularQuestionKey, reportQuestionId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  if (!popularQuestionKey === !reportQuestionId) {
    throw new GraphQLError('Pick a popular question or one of your recent ones')
  }

  // RESOLUTION
  if (popularQuestionKey) {
    const popularQuestions = await selectPopularReportQuestions()
    const popular = popularQuestions.find(({key}) => key === popularQuestionKey)
    if (!popular) throw new GraphQLError('That popular question isn’t available')
    const reportQuestion = await recordReportQuestion({
      userId: viewerId,
      orgId,
      source: 'popular',
      question: popular.question,
      title: popular.title,
      spec: popular.spec,
      popularQuestionId: popular.id
    })
    return {reportQuestion}
  }
  const [id] = CipherId.fromClient(reportQuestionId!)
  const reportQuestion = await getKysely()
    .updateTable('ReportQuestion')
    .set({uses: sql`uses + 1`, lastUsedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', id)
    .where('userId', '=', viewerId)
    .where('orgId', '=', orgId)
    .returningAll()
    .executeTakeFirst()
  if (!reportQuestion) throw new GraphQLError('That isn’t one of your recent questions')
  return {reportQuestion}
}

export default startReportQuestion
