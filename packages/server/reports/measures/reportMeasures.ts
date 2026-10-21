import type {ReportMeasure} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureQuery, ReportMeasureResult} from '../reportMeasureTypes'
import countDiscussions from './countDiscussions'
import countDoneTasks from './countDoneTasks'
import countMeetings from './countMeetings'
import countNewTasks from './countNewTasks'
import countTasksPushed from './countTasksPushed'
import countTeamsThatMet from './countTeamsThatMet'
import findLastMeeting from './findLastMeeting'
import readActivePeople from './readActivePeople'
import readMembers from './readMembers'
import readOpenTasks from './readOpenTasks'
import readUserIntegrations from './readUserIntegrations'

const reportMeasures: Record<
  ReportMeasure,
  (query: ReportMeasureQuery) => Promise<ReportMeasureResult>
> = {
  ACTIVE_PEOPLE: readActivePeople,
  MEMBERS: readMembers,
  MEETINGS: countMeetings,
  TEAMS_THAT_MET: countTeamsThatMet,
  LAST_MEETING: findLastMeeting,
  DISCUSSIONS: (query) => countDiscussions(query, {withTask: false}),
  DISCUSSIONS_WITH_A_TASK: (query) => countDiscussions(query, {withTask: true}),
  NEW_TASKS: countNewTasks,
  DONE_TASKS: countDoneTasks,
  OPEN_TASKS: readOpenTasks,
  USER_INTEGRATIONS: readUserIntegrations,
  TASKS_PUSHED: countTasksPushed
}

export default reportMeasures
