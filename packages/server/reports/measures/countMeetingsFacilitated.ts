import {expressionBuilder} from 'kysely'
import {REPORT_NO_USER} from '../../../client/shared/reports/reportCatalog'
import getKysely from '../../postgres/getKysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'
import {templateOf} from './templateExpressions'

const selectMeetings = () =>
  getKysely()
    .selectFrom('NewMeeting as m')
    .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')
    .leftJoin('User as fu', 'fu.id', 'm.facilitatorUserId')

const countMeetingsFacilitated = (query: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectMeetings())
  const template = templateOf(
    {
      templateId: eb.ref('m.templateId'),
      teamId: eb.ref('m.teamId'),
      scope: eb.ref('tpl.scope'),
      type: eb.ref('tpl.type'),
      name: eb.ref('tpl.name')
    },
    query.ownTeamIds
  )
  return countReportRows(query, selectMeetings(), {
    where: [isAnyOf(eb.ref('m.teamId'), query.teamIds), hasEnoughAttendees(eb.ref('m.id'))],
    timestamp: eb.ref('m.createdAt'),
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      USER: eb.fn.coalesce('m.facilitatorUserId', eb.val(REPORT_NO_USER)),
      MEETING_TYPE: eb.cast<string>('m.meetingType', 'text'),
      TEMPLATE: template.key
    },
    labels: {USER: eb.ref('fu.preferredName'), TEMPLATE: template.label},
    value: eb.cast<number>(eb.fn.countAll(), 'integer')
  })
}

export default countMeetingsFacilitated
