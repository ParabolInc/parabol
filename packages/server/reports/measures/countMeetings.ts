import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'
import {templateOf} from './templateExpressions'

const selectMeetings = () =>
  getKysely()
    .selectFrom('NewMeeting as m')
    .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')

const joinAttendees = (meetings: ReturnType<typeof selectMeetings>) =>
  meetings
    .innerJoin('MeetingMember as mm', 'mm.meetingId', 'm.id')
    .innerJoin('User as mu', 'mu.id', 'mm.userId')

// By person, a meeting counts once for each person who joined it
const countMeetings = (query: ReportMeasureQuery) => {
  const isByUser = [...query.dimensions, ...query.filters.map(({dimension}) => dimension)].includes(
    'USER'
  )
  const eb = expressionBuilder(joinAttendees(selectMeetings()))
  const template = templateOf(
    {
      templateId: eb.ref('m.templateId'),
      teamId: eb.ref('m.teamId'),
      scope: eb.ref('tpl.scope'),
      name: eb.ref('tpl.name')
    },
    query.ownTeamIds
  )
  return countReportRows(query, selectMeetings().$if(isByUser, joinAttendees), {
    where: [isAnyOf(eb.ref('m.teamId'), query.teamIds), hasEnoughAttendees(eb.ref('m.id'))],
    timestamp: eb.ref('m.createdAt'),
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      USER: eb.ref('mm.userId'),
      MEETING_TYPE: eb.cast<string>('m.meetingType', 'text'),
      TEMPLATE: template.key
    },
    labels: {USER: eb.ref('mu.preferredName'), TEMPLATE: template.label},
    value: eb.cast<number>(eb.fn.count('m.id').distinct(), 'integer')
  })
}

export default countMeetings
