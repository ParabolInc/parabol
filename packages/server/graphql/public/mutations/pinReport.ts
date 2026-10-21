import {GraphQLError} from 'graphql'
import {parseReportSpec} from '../../../../client/shared/reports/parseReportSpec'
import getKysely from '../../../postgres/getKysely'
import readReportSpecInput from '../../../reports/readReportSpecInput'
import {MAX_REPORT_PINS, selectActiveReportPins, toReportRowId} from '../../../reports/reportPins'
import toReportSpecShape from '../../../reports/toReportSpecShape'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const pinReport: MutationResolvers['pinReport'] = async (
  _source,
  {orgId, spec: specInput, title, reportQuestionId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  const spec = readReportSpecInput(specInput)
  const pinTitle = title.trim()
  if (!pinTitle || pinTitle.length > 255)
    throw new GraphQLError('A pin’s name is 1 to 255 characters')
  const reportQuestionRowId = reportQuestionId ? toReportRowId(reportQuestionId) : null
  const reportQuestion = reportQuestionRowId
    ? await pg
        .selectFrom('ReportQuestion')
        .select(['source', 'question', 'popularQuestionId'])
        .where('id', '=', reportQuestionRowId)
        .where('userId', '=', viewerId)
        .where('orgId', '=', orgId)
        .executeTakeFirst()
    : undefined

  // RESOLUTION
  const specJSON = JSON.stringify(spec)
  const pinRowId = await pg.transaction().execute(async (trx) => {
    const pins = await selectActiveReportPins(trx, orgId)
    const samePin = pins.find((pin) => JSON.stringify(parseReportSpec(pin.spec)) === specJSON)
    if (samePin) return samePin.id
    if (pins.length >= MAX_REPORT_PINS) {
      throw new GraphQLError(`Reports holds ${MAX_REPORT_PINS} pins. Unpin one first`)
    }
    const {id} = await trx
      .insertInto('ReportPin')
      .values({
        orgId,
        createdBy: viewerId,
        source: reportQuestion?.source ?? null,
        question: reportQuestion?.question ?? null,
        popularQuestionId: reportQuestion?.popularQuestionId ?? null,
        title: pinTitle,
        spec: specJSON,
        shape: toReportSpecShape(spec),
        sortOrder: Math.min(1, ...pins.map(({sortOrder}) => sortOrder)) - 1
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    return id
  })
  return {orgId, pinRowId}
}

export default pinReport
