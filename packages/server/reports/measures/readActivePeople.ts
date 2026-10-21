import {sql} from 'kysely'
import selectOrgUserActivitySpans, {
  isOrgUserActiveAt
} from '../../postgres/queries/selectOrgUserActivitySpans'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isTeamMemberAt, readReportRows} from '../reportQueries'

const span = {
  eventType: sql.ref<string>('s.eventType'),
  eventDate: sql.ref<Date>('s.eventDate'),
  nextEventDate: sql.ref<Date | null>('s.nextEventDate')
}

const readActivePeople = (query: ReportMeasureQuery) => {
  const spans = sql`(${selectOrgUserActivitySpans(query.orgId)}) AS s`
  if (query.isWholeOrg) {
    return readReportRows(query, {
      from: spans,
      where: [],
      isPresentAt: (at) => isOrgUserActiveAt(span, at),
      dimensions: {},
      value: sql<number>`count(DISTINCT s."userId")::int`
    })
  }
  return readReportRows(query, {
    from: sql`${spans} JOIN "TeamMember" AS mem ON mem."userId" = s."userId"`,
    where: [sql<boolean>`mem."teamId" = ANY(${query.teamIds}::text[])`],
    isPresentAt: (at) =>
      sql<boolean>`${isOrgUserActiveAt(span, at)} AND ${isTeamMemberAt('mem', at)}`,
    dimensions: {TEAM: sql<string>`mem."teamId"`},
    value: sql<number>`count(DISTINCT s."userId")::int`
  })
}

export default readActivePeople
