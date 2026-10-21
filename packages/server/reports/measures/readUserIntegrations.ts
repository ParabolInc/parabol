import {sql} from 'kysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {readReportRows} from '../reportQueries'

// Slack keeps its own table. A disconnected integration is dated by its last update
const connections = sql`(
  SELECT "userId", "teamId", service::text AS service, "createdAt", "isActive", "updatedAt"
  FROM "TeamMemberIntegrationAuth"
  UNION ALL
  SELECT "userId", "teamId", 'slack' AS service, "createdAt", "isActive", "updatedAt"
  FROM "SlackAuth"
) AS c`

const readUserIntegrations = (query: ReportMeasureQuery) =>
  readReportRows(query, {
    from: connections,
    where: [sql<boolean>`c."teamId" = ANY(${query.teamIds}::text[])`],
    isPresentAt: (at) =>
      sql<boolean>`c."createdAt" <= ${at} AND (c."isActive" OR c."updatedAt" > ${at})`,
    dimensions: {
      TEAM: sql<string>`c."teamId"`,
      INTEGRATION: sql<string>`c.service`
    },
    value: sql<number>`count(DISTINCT (c."userId", c.service))::int`
  })

export default readUserIntegrations
