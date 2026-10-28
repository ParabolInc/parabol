import {type Expression, expressionBuilder} from 'kysely'
import {
  REPORT_NO_TEMPLATE,
  REPORT_OTHER_TEAM_TEMPLATE
} from '../../../client/shared/reports/reportCatalog'
import type {DB} from '../../postgres/types/pg'
import {isAnyOf} from '../reportQueries'

const eb = expressionBuilder<DB>()

// A team's own template is named only to the people on that team, the same people who can pick it
export const templateOf = (
  {
    templateId,
    teamId,
    scope,
    name
  }: {
    templateId: Expression<string | null>
    teamId: Expression<string | null>
    scope: Expression<string | null>
    name: Expression<string | null>
  },
  ownTeamIds: string[]
) => {
  const isNamed = eb.or([eb(scope, 'in', ['PUBLIC', 'ORGANIZATION']), isAnyOf(teamId, ownTeamIds)])
  return {
    key: eb
      .case()
      .when(eb(templateId, 'is', null))
      .then(REPORT_NO_TEMPLATE)
      .when(isNamed)
      .then(templateId)
      .else(REPORT_OTHER_TEAM_TEMPLATE)
      .end(),
    label: eb.case().when(isNamed).then(name).end()
  }
}
