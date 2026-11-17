import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportPagePeriod} from './reportPeriodParam'
import toAllTeamsReportSpecs from './toAllTeamsReportSpecs'
import toLastHeldReportSpec from './toLastHeldReportSpec'
import withPagePeriod from './withPagePeriod'

// The query variables of a report's panel, with the side reports some views add. A view without one sends its own
// spec in its place, which @include leaves unrun
const toReportPanelVariables = (spec: ReportSpec, period: ReportPagePeriod) => {
  const lastHeldSpec = toLastHeldReportSpec(spec)
  const allTeamsSpecs = toAllTeamsReportSpecs(spec)
  return {
    spec: withPagePeriod(spec, period),
    lastHeldSpec: withPagePeriod(lastHeldSpec ?? spec, period),
    hasLastHeld: !!lastHeldSpec,
    allTeamsSpec: withPagePeriod(allTeamsSpecs?.byCategory ?? spec, period),
    allTeamsTotalSpec: withPagePeriod(allTeamsSpecs?.overall ?? spec, period),
    hasAllTeams: !!allTeamsSpecs
  }
}

export default toReportPanelVariables
