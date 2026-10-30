import stringify from 'fast-json-stable-stringify'
import {GraphQLError} from 'graphql'
import {parseReportSpec} from '../../../../client/shared/reports/parseReportSpec'
import getKysely from '../../../postgres/getKysely'
import {
  fromReportKey,
  MAX_REPORT_PINS,
  selectActivePinnedReports
} from '../../../reports/pinnedReports'
import readReportSpecInput from '../../../reports/readReportSpecInput'
import toReportSpecShape from '../../../reports/toReportSpecShape'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const pinReport: MutationResolvers['pinReport'] = async (
  _source,
  {orgId, spec: specInput, title, reportQuestionId: reportQuestionKey},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  const spec = readReportSpecInput(specInput)
  const pinTitle = title.trim()
  if (!pinTitle || pinTitle.length > 255)
    throw new GraphQLError('A pin’s name is 1 to 255 characters')
  const reportQuestionId = reportQuestionKey ? fromReportKey(reportQuestionKey) : null
  const reportQuestion = reportQuestionId
    ? await pg
        .selectFrom('ReportQuestion')
        .select(['source', 'question'])
        .where('id', '=', reportQuestionId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .executeTakeFirst()
    : undefined

  // RESOLUTION
  const specJSON = stringify(spec)
  const pinnedReportId = await pg.transaction().execute(async (trx) => {
    const pins = await selectActivePinnedReports(trx, orgId)
    const samePin = pins.find((pin) => stringify(parseReportSpec(pin.spec).spec) === specJSON)
    if (samePin) return samePin.id
    if (pins.length >= MAX_REPORT_PINS) {
      throw new GraphQLError(`Reports holds ${MAX_REPORT_PINS} pins. Unpin one first`)
    }
    const {id} = await trx
      .insertInto('PinnedReport')
      .values({
        orgId,
        createdBy: viewerId,
        source: reportQuestion?.source ?? null,
        question: reportQuestion?.question ?? null,
        title: pinTitle,
        spec: specJSON,
        shape: toReportSpecShape(spec),
        sortOrder: Math.min(1, ...pins.map(({sortOrder}) => sortOrder)) - 1
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    return id
  })
  return {orgId, pinnedReportId}
}

export default pinReport
