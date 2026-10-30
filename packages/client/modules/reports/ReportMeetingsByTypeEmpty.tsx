import ReportBarsView from './ReportBarsView'
import ReportEmptyPrompt from './ReportEmptyPrompt'
import ReportSampleBehind from './ReportSampleBehind'
import {
  SAMPLE_MEETINGS_BY_TYPE_ROWS,
  SAMPLE_MEETINGS_BY_TYPE_SPEC
} from './reportMeetingsByTypeSample'

interface Props {
  isCompact?: boolean
}

// Before any team has held a meeting, sample bars show what the report will look like behind the prompt to run one
const ReportMeetingsByTypeEmpty = ({isCompact = false}: Props) => (
  <ReportSampleBehind
    isCompact={isCompact}
    sample={
      <ReportBarsView
        spec={SAMPLE_MEETINGS_BY_TYPE_SPEC}
        step='MONTH'
        rows={SAMPLE_MEETINGS_BY_TYPE_ROWS}
        isCompact={isCompact}
      />
    }
  >
    <ReportEmptyPrompt
      title='Run your first meeting'
      description={
        isCompact
          ? 'Hold a meeting to see what your teams run each month.'
          : 'Hold a meeting with your team, and this chart shows how many meetings of each type your teams run, month by month. The meetings behind this are a sample.'
      }
      actionLabel='Start a meeting'
      action={{to: '/activity-library'}}
      isCompact={isCompact}
    />
  </ReportSampleBehind>
)

export default ReportMeetingsByTypeEmpty
