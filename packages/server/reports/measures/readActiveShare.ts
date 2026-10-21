import {type RawBuilder, sql} from 'kysely'
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

// The members active at each reading as a percentage of all the members then, or null without members
const percentActive = (memberId: RawBuilder<string>) =>
  sql<number>`round(100.0 * count(DISTINCT s."userId") / NULLIF(count(DISTINCT ${memberId}), 0), 1)::float8`

const readActiveShare = (query: ReportMeasureQuery) => {
  const joinActiveSpans = (memberId: RawBuilder<string>) =>
    sql`LEFT JOIN (${selectOrgUserActivitySpans(query.orgId)}) AS s
      ON s."userId" = ${memberId} AND ${isOrgUserActiveAt(span, sql.ref('Step.readAt'))}`
  if (query.isWholeOrg) {
    const memberId = sql.ref<string>('ou.userId')
    return readReportRows(query, {
      from: sql`"OrganizationUser" AS ou ${joinActiveSpans(memberId)}`,
      where: [sql<boolean>`ou."orgId" = ${query.orgId}`],
      isPresentAt: (at) =>
        sql<boolean>`ou."joinedAt" <= ${at} AND (ou."removedAt" IS NULL OR ou."removedAt" > ${at})`,
      dimensions: {},
      value: percentActive(memberId)
    })
  }
  const memberId = sql.ref<string>('mem.userId')
  return readReportRows(query, {
    from: sql`"TeamMember" AS mem ${joinActiveSpans(memberId)}`,
    where: [sql<boolean>`mem."teamId" = ANY(${query.teamIds}::text[])`],
    isPresentAt: (at) => isTeamMemberAt('mem', at),
    dimensions: {TEAM: sql<string>`mem."teamId"`},
    value: percentActive(memberId)
  })
}

export default readActiveShare
