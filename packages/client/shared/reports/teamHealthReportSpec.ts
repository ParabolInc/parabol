import type {ReportDimension, ReportSpec} from './reportCatalog'

const isTeamDimension = (dimension: ReportDimension) =>
  dimension === 'TEAM' || dimension === 'TEAM_LEVEL'

// A Health score heatmap whose columns are categories and whose rows are teams, team structure levels, or a level then
// teams, marks the cells that need attention
export const isTeamHealthHeatmapSpec = ({showAs, measures, breakdown}: ReportSpec) => {
  const rows = breakdown.slice(0, -1).map(({dimension}) => dimension)
  const teamPosition = rows.indexOf('TEAM')
  return (
    showAs === 'HEATMAP' &&
    measures[0] === 'HEALTH_SCORE' &&
    breakdown[breakdown.length - 1]?.dimension === 'CATEGORY' &&
    rows.length > 0 &&
    rows.every(isTeamDimension) &&
    (teamPosition === -1 || teamPosition === rows.length - 1)
  )
}

// The Team Health heatmap a report turns into when it switches to Health score: a row for each team, under the team
// structure level it already split by, a column for each category, and each team's check before to compare with
export const toTeamHealthHeatmapSpec = (spec: ReportSpec): ReportSpec => {
  const level = spec.breakdown.find(({dimension}) => dimension === 'TEAM_LEVEL')
  return {
    ...spec,
    measures: ['HEALTH_SCORE'],
    breakdown: [...(level ? [level] : []), {dimension: 'TEAM'}, {dimension: 'CATEGORY'}],
    compareTo: 'PREVIOUS_CHECK',
    showAs: 'HEATMAP',
    sort: null,
    limit: null
  }
}
