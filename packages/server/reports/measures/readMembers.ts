import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isTeamMemberAt, readReportRows} from '../reportQueries'

const readMembers = (query: ReportMeasureQuery) => {
  if (query.isWholeOrg) {
    return readReportRows(query, {
      from: sql`"OrganizationUser" AS ou`,
      where: [sql<boolean>`ou."orgId" = ${query.orgId}`],
      isPresentAt: (at) =>
        sql<boolean>`ou."joinedAt" <= ${at} AND (ou."removedAt" IS NULL OR ou."removedAt" > ${at})`,
      dimensions: {},
      value: sql<number>`count(DISTINCT ou."userId")::int`
    })
  }
  return readReportRows(query, {
    from: sql`"TeamMember" AS mem`,
    where: [sql<boolean>`mem."teamId" = ANY(${query.teamIds}::text[])`],
    isPresentAt: (at) => isTeamMemberAt('mem', at),
    dimensions: {TEAM: sql<string>`mem."teamId"`},
    value: sql<number>`count(DISTINCT mem."userId")::int`
  })
}

export default readMembers
