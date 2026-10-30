import ReportEmptyPrompt from './ReportEmptyPrompt'
import ReportHeatmapView from './ReportHeatmapView'
import ReportSampleBehind from './ReportSampleBehind'
import {
  SAMPLE_RETRO_CADENCE_LAST_HELD,
  SAMPLE_RETRO_CADENCE_ROW_TOTALS,
  SAMPLE_RETRO_CADENCE_ROWS,
  SAMPLE_RETRO_CADENCE_SPEC
} from './reportRetroCadenceSample'
import {RETRO_DETAILS_URL} from './retroDetailsUrl'

interface Props {
  isCompact?: boolean
}

// Before any team has held a retrospective, a sample cadence shows what the report will look like behind the prompt to
// run one
const ReportRetroCadenceEmpty = ({isCompact = false}: Props) => (
  <ReportSampleBehind
    sample={
      <ReportHeatmapView
        spec={SAMPLE_RETRO_CADENCE_SPEC}
        step='MONTH'
        rows={SAMPLE_RETRO_CADENCE_ROWS}
        rowTotals={SAMPLE_RETRO_CADENCE_ROW_TOTALS}
        isCompact={isCompact}
        lastHeldByTeamId={isCompact ? undefined : SAMPLE_RETRO_CADENCE_LAST_HELD}
      />
    }
  >
    <ReportEmptyPrompt
      title='Run your first retro'
      description={
        isCompact
          ? 'Hold a retrospective to see how often every team reflects.'
          : 'Hold a retrospective with your team, and this heatmap shows how often every team reflects, month by month. The teams behind this are a sample.'
      }
      actionLabel='Start a retro'
      to={RETRO_DETAILS_URL}
      isCompact={isCompact}
    />
  </ReportSampleBehind>
)

export default ReportRetroCadenceEmpty
