import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {groupReportRows, isAnyOf, toEpochMilliseconds} from '../reportQueries'
import {templateOf} from './templateExpressions'

// The value is the start of the latest counted meeting in the period, in milliseconds since the epoch
const findLastMeeting = (query: ReportMeasureQuery) => {
  const {teamIds, ownTeamIds, stepStarts, stepEnds} = query
  const from = getKysely()
    .selectFrom('NewMeeting as m')
    .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')
  const eb = expressionBuilder(from)
  const template = templateOf(
    {
      templateId: eb.ref('m.templateId'),
      teamId: eb.ref('m.teamId'),
      scope: eb.ref('tpl.scope'),
      name: eb.ref('tpl.name')
    },
    ownTeamIds
  )
  return groupReportRows(query, from, {
    stepIndex: eb.lit(1),
    where: [
      isAnyOf(eb.ref('m.teamId'), teamIds),
      eb('m.createdAt', '>=', stepStarts[0]!),
      eb('m.createdAt', '<', stepEnds[stepEnds.length - 1]!),
      hasEnoughAttendees(eb.ref('m.id'))
    ],
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      MEETING_TYPE: eb.cast<string>('m.meetingType', 'text'),
      TEMPLATE: template.key
    },
    labels: {TEMPLATE: template.label},
    value: toEpochMilliseconds(eb.fn.max('m.createdAt'))
  })
}

export default findLastMeeting
