import {type Expression, expressionBuilder, sql} from 'kysely'
import {
  REPORT_NO_TEMPLATE,
  REPORT_OTHER_TEAM_TEMPLATE
} from '../../../client/shared/reports/reportCatalog'
import type {DB} from '../../postgres/types/pg'
import {isAnyOf} from '../reportQueries'

const eb = expressionBuilder<DB>()

interface TemplateColumns<Value> {
  templateId: Value
  teamId: Value
  scope: Value
  type: Value
  name: Value
}

// Templates of one type that share a name are one template, like the copies teams make of a public one. A team's
// own template is named only to the people on that team, the same people who can pick it
export const templateOf = (
  {templateId, teamId, scope, type, name}: TemplateColumns<Expression<string | null>>,
  ownTeamIds: string[]
) => {
  const isNamed = eb.or([eb(scope, 'in', ['PUBLIC', 'ORGANIZATION']), isAnyOf(teamId, ownTeamIds)])
  return {
    key: eb
      .case()
      .when(eb(templateId, 'is', null))
      .then(REPORT_NO_TEMPLATE)
      .when(isNamed)
      .then(sql<string>`${type} || ':' || lower(btrim(${name}))`)
      .else(REPORT_OTHER_TEAM_TEMPLATE)
      .end(),
    label: eb.case().when(isNamed).then(sql<string>`btrim(${name})`).end()
  }
}

// The same naming for a template already read, like a Team Health check's
export const toTemplateKey = (
  {templateId, teamId, scope, type, name}: TemplateColumns<string | null>,
  ownTeamIds: string[]
) => {
  if (templateId === null) return {key: REPORT_NO_TEMPLATE, label: null}
  const trimmedName = name?.replace(/^ +| +$/g, '') ?? null
  const isNamed =
    scope === 'PUBLIC' || scope === 'ORGANIZATION' || (!!teamId && ownTeamIds.includes(teamId))
  return isNamed
    ? {key: `${type}:${trimmedName?.toLowerCase()}`, label: trimmedName}
    : {key: REPORT_OTHER_TEAM_TEMPLATE, label: null}
}
