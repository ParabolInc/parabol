import type {ReportMeasure} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureFunction} from '../reportMeasureTypes'
import countDiscussions from './countDiscussions'
import countDoneTasks from './countDoneTasks'
import countMeetings from './countMeetings'
import countNewTasks from './countNewTasks'
import countTasksPushed from './countTasksPushed'
import countTeamsThatMet from './countTeamsThatMet'
import findLastMeeting from './findLastMeeting'
import findLastSeen from './findLastSeen'
import medianDaysToDone from './medianDaysToDone'
import readActiveShare from './readActiveShare'
import readActiveUsers from './readActiveUsers'
import readHealthScore from './readHealthScore'
import readMembers from './readMembers'
import readOpenTasks from './readOpenTasks'
import readUserIntegrations from './readUserIntegrations'

const reportMeasures: Record<ReportMeasure, ReportMeasureFunction> = {
  ACTIVE_USERS: readActiveUsers,
  MEMBERS: readMembers,
  ACTIVE_SHARE: readActiveShare,
  LAST_SEEN: findLastSeen,
  MEETINGS: countMeetings,
  TEAMS_THAT_MET: countTeamsThatMet,
  LAST_MEETING: findLastMeeting,
  DISCUSSIONS: (query) => countDiscussions(query, {withTask: false}),
  DISCUSSIONS_WITH_A_TASK: (query) => countDiscussions(query, {withTask: true}),
  NEW_TASKS: countNewTasks,
  DONE_TASKS: countDoneTasks,
  OPEN_TASKS: readOpenTasks,
  DAYS_TO_DONE: medianDaysToDone,
  USER_INTEGRATIONS: readUserIntegrations,
  TASKS_PUSHED: countTasksPushed,
  HEALTH_SCORE: readHealthScore
}

export default reportMeasures
