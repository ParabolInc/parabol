import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import selectOrgUserActivitySpans, {
  isOrgUserActiveAt
} from '../../postgres/queries/selectOrgUserActivitySpans'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isAnyOf, isTeamMemberAt, readingSteps, readReportRows} from '../reportQueries'

const readActiveUsers = (query: ReportMeasureQuery) => {
  const spans = getKysely()
    .selectFrom(readingSteps(query.readAt))
    .crossJoin(selectOrgUserActivitySpans(query.orgId).as('s'))
  const from = spans.innerJoin('TeamMember as mem', 'mem.userId', 's.userId')
  const eb = expressionBuilder(from)
  const span = {
    eventType: eb.ref('s.eventType'),
    eventDate: eb.ref('s.eventDate'),
    nextEventDate: eb.ref('s.nextEventDate')
  }
  const value = eb.cast<number>(eb.fn.count('s.userId').distinct(), 'integer')
  if (query.isWholeOrg) {
    return readReportRows(query, spans, {
      where: [],
      isPresentAt: (at) => isOrgUserActiveAt(span, at),
      dimensions: {},
      value
    })
  }
  return readReportRows(query, from, {
    where: [isAnyOf(eb.ref('mem.teamId'), query.teamIds)],
    isPresentAt: (at) =>
      eb.and([
        isOrgUserActiveAt(span, at),
        isTeamMemberAt(
          {
            createdAt: eb.ref('mem.createdAt'),
            isNotRemoved: eb.ref('mem.isNotRemoved'),
            updatedAt: eb.ref('mem.updatedAt')
          },
          at
        )
      ]),
    dimensions: {TEAM: eb.ref('mem.teamId')},
    value
  })
}

export default readActiveUsers
