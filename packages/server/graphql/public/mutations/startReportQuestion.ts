import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {parseReportSpec} from '../../../../client/shared/reports/parseReportSpec'
import getKysely from '../../../postgres/getKysely'
import {toReportRowId} from '../../../reports/pinnedReports'
import readReportSpecInput from '../../../reports/readReportSpecInput'
import recordReportQuestion from '../../../reports/recordReportQuestion'
import selectPopularReportQuestions from '../../../reports/selectPopularReportQuestions'
import toReportSpecShape from '../../../reports/toReportSpecShape'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const startReportQuestion: MutationResolvers['startReportQuestion'] = async (
  _source,
  {orgId, popularQuestionKey, reportQuestionId, spec: specInput, title},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const isBuilt = !!specInput && !reportQuestionId
  if ([!!popularQuestionKey, !!reportQuestionId, isBuilt].filter(Boolean).length !== 1) {
    throw new GraphQLError(
      'Pick a popular question, one of your recent ones, or a report you built'
    )
  }
  const spec = specInput ? readReportSpecInput(specInput) : null
  const builtTitle = title?.trim()
  if (isBuilt && (!builtTitle || builtTitle.length > 255)) {
    throw new GraphQLError('A report you built needs a name of 1 to 255 characters')
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
  if (isBuilt && spec && builtTitle) {
    const reportQuestion = await recordReportQuestion({
      userId: viewerId,
      orgId,
      source: 'builder',
      question: null,
      title: builtTitle,
      spec
    })
    return {reportQuestion}
  }
  const rowId = toReportRowId(reportQuestionId!)
  const pg = getKysely()
  const recent = rowId
    ? await pg
        .selectFrom('ReportQuestion')
        .select('spec')
        .where('id', '=', rowId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .executeTakeFirst()
    : undefined
  if (!rowId || !recent) throw new GraphQLError('That isn’t one of your recent questions')
  // a changed spec is kept as the one used, which shows where the first one missed
  const isChanged = !!spec && JSON.stringify(spec) !== JSON.stringify(parseReportSpec(recent.spec))
  const reportQuestion = await pg
    .updateTable('ReportQuestion')
    .set({
      uses: sql`uses + 1`,
      lastUsedAt: sql`CURRENT_TIMESTAMP`,
      ...(isChanged && spec
        ? {
            spec: JSON.stringify(spec),
            shape: toReportSpecShape(spec),
            outcome: 'shown' as const,
            editedAt: sql`CURRENT_TIMESTAMP`
          }
        : {})
    })
    .where('id', '=', rowId)
    .returningAll()
    .executeTakeFirstOrThrow()
  return {reportQuestion}
}

export default startReportQuestion
