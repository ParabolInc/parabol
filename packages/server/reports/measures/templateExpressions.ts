import {sql} from 'kysely'
import {
  REPORT_NO_TEMPLATE,
  REPORT_OTHER_TEAM_TEMPLATE
} from '../../../client/shared/reports/reportCatalog'

// A team's own template is named only to the people on that team, the same people who can pick it
export const templateOf = (meetingAlias: string, templateAlias: string, ownTeamIds: string[]) => {
  const templateId = sql.ref<string | null>(`${meetingAlias}.templateId`)
  const isNamed = sql<boolean>`(
    ${sql.ref(`${templateAlias}.scope`)} IN ('PUBLIC', 'ORGANIZATION')
    OR ${sql.ref(`${meetingAlias}.teamId`)} = ANY(${ownTeamIds}::text[])
  )`
  return {
    key: sql<string>`CASE
      WHEN ${templateId} IS NULL THEN ${REPORT_NO_TEMPLATE}
      WHEN ${isNamed} THEN ${templateId}
      ELSE ${REPORT_OTHER_TEAM_TEMPLATE}
    END`,
    label: sql<string>`CASE WHEN ${isNamed} THEN ${sql.ref(`${templateAlias}.name`)} END`
  }
}
