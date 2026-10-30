import {TEAM_HEALTH_DETAILS_URL} from '../../components/TeamHealthDemo/teamHealthDetailsUrl'
import ReportEmptyPrompt from './ReportEmptyPrompt'
import ReportHeatmapView from './ReportHeatmapView'
import ReportSampleBehind from './ReportSampleBehind'
import ReportTeamHealthHeatmap from './ReportTeamHealthHeatmap'
import {
  SAMPLE_TEAM_HEALTH_ALL_TEAMS,
  SAMPLE_TEAM_HEALTH_CHECKS,
  SAMPLE_TEAM_HEALTH_ROW_TOTALS,
  SAMPLE_TEAM_HEALTH_ROWS,
  SAMPLE_TEAM_HEALTH_SPEC
} from './reportTeamHealthSample'

interface Props {
  orgId: string
  // a pinned card, which shows the plain heatmap a pinned Team Health report does
  isCompact?: boolean
}

// Before any team has run a check, a sample heatmap shows what the report will look like behind the prompt to run one
const ReportTeamHealthEmpty = ({orgId, isCompact = false}: Props) => (
  <ReportSampleBehind
    isCompact={isCompact}
    sample={
      isCompact ? (
        <ReportHeatmapView
          spec={SAMPLE_TEAM_HEALTH_SPEC}
          step={null}
          rows={SAMPLE_TEAM_HEALTH_ROWS}
          rowTotals={SAMPLE_TEAM_HEALTH_ROW_TOTALS}
          isCompact
        />
      ) : (
        <ReportTeamHealthHeatmap
          orgId={orgId}
          spec={SAMPLE_TEAM_HEALTH_SPEC}
          rowHeading='Team'
          rows={SAMPLE_TEAM_HEALTH_ROWS}
          rowTotals={SAMPLE_TEAM_HEALTH_ROW_TOTALS}
          checks={SAMPLE_TEAM_HEALTH_CHECKS}
          allTeamsRows={SAMPLE_TEAM_HEALTH_ALL_TEAMS}
        />
      )
    }
  >
    <ReportEmptyPrompt
      title='Run your first Team Health check'
      description={
        isCompact
          ? 'Run it across your organization to see how every team feels.'
          : 'Run it across your organization, and this heatmap shows how every team feels in each category and marks what needs attention. The teams behind this are a sample.'
      }
      actionLabel='Start Team Health'
      action={{to: TEAM_HEALTH_DETAILS_URL}}
      isCompact={isCompact}
    />
  </ReportSampleBehind>
)

export default ReportTeamHealthEmpty
