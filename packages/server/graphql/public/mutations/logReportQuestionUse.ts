import stringify from 'fast-json-stable-stringify'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {parseReportSpec} from '../../../../client/shared/reports/parseReportSpec'
import {POPULAR_REPORT_QUESTIONS} from '../../../../client/shared/reports/popularReportQuestions'
import getKysely from '../../../postgres/getKysely'
import {fromReportKey} from '../../../reports/pinnedReports'
import readReportSpecInput from '../../../reports/readReportSpecInput'
import recordReportQuestion from '../../../reports/recordReportQuestion'
import toReportSpecShape from '../../../reports/toReportSpecShape'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const logReportQuestionUse: MutationResolvers['logReportQuestionUse'] = async (
  _source,
  {orgId, popularQuestionKey, reportQuestionId: reportQuestionKey, spec: specInput, title},
  {authToken}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const isBuilt = !!specInput && !reportQuestionKey
  if ([!!popularQuestionKey, !!reportQuestionKey, isBuilt].filter(Boolean).length !== 1) {
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
    const popular = POPULAR_REPORT_QUESTIONS.find(({key}) => key === popularQuestionKey)
    if (!popular) throw new GraphQLError('That popular question isn’t available')
    const reportQuestion = await recordReportQuestion({
      userId: viewerId,
      orgId,
      source: 'popular',
      question: popular.question,
      title: popular.title,
      spec: popular.spec
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
  const reportQuestionId = fromReportKey(reportQuestionKey!)
  const pg = getKysely()
  const recent = reportQuestionId
    ? await pg
        .selectFrom('ReportQuestion')
        .select('spec')
        .where('id', '=', reportQuestionId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .executeTakeFirst()
    : undefined
  if (!reportQuestionId || !recent)
    throw new GraphQLError('That isn’t one of your recent questions')
  // a changed spec is kept as the one used, which shows where the first one missed
  const isChanged = !!spec && stringify(spec) !== stringify(parseReportSpec(recent.spec).spec)
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
    .where('id', '=', reportQuestionId)
    .returningAll()
    .executeTakeFirstOrThrow()
  return {reportQuestion}
}

export default logReportQuestionUse
