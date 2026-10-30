import ReportEmptyPrompt from './ReportEmptyPrompt'
import ReportFlowView from './ReportFlowView'
import ReportSampleBehind from './ReportSampleBehind'
import {
  SAMPLE_TASK_FLOW_BREAKDOWN_NAMES,
  SAMPLE_TASK_FLOW_ROWS,
  SAMPLE_TASK_FLOW_SPEC
} from './reportTaskFlowSample'
import {RETRO_DETAILS_URL} from './retroDetailsUrl'

interface Props {
  isCompact?: boolean
}

// Before any team has made a task, a sample flow shows what the report will look like behind the prompt to add one
const ReportTaskFlowEmpty = ({isCompact = false}: Props) => (
  <ReportSampleBehind
    isCompact={isCompact}
    sample={
      <ReportFlowView
        spec={SAMPLE_TASK_FLOW_SPEC}
        breakdownNames={SAMPLE_TASK_FLOW_BREAKDOWN_NAMES}
        rows={SAMPLE_TASK_FLOW_ROWS}
        isCompact={isCompact}
      />
    }
  >
    <ReportEmptyPrompt
      title='Add your first task'
      description={
        isCompact
          ? 'Add tasks in a retro to see where they end up.'
          : 'Add tasks in a retrospective, and this flow shows which meetings your tasks come from and whether they get done. The tasks behind this are a sample.'
      }
      actionLabel='Start a retro'
      action={{to: RETRO_DETAILS_URL}}
      isCompact={isCompact}
    />
  </ReportSampleBehind>
)

export default ReportTaskFlowEmpty
