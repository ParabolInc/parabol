import type {ReportSpec} from '../../shared/reports/reportCatalog'

// A flow of new tasks from the meetings they came from to their status, which shows a sample before any team has
// made a task
const isTaskFlowSpec = ({measures, breakdown, showAs}: ReportSpec) =>
  showAs === 'FLOW' &&
  measures[0] === 'NEW_TASKS' &&
  breakdown.length === 2 &&
  breakdown[0]!.dimension === 'MEETING_TYPE' &&
  breakdown[1]!.dimension === 'TASK_STATUS'

export default isTaskFlowSpec
