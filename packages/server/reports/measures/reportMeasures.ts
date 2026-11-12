import type {ReportMeasure} from '../../../client/shared/reports/reportCatalog'
import type {ReportMeasureFunction} from '../reportMeasureTypes'
import countDiscussions from './countDiscussions'
import countDoneTasks from './countDoneTasks'
import countInvitations from './countInvitations'
import countMeetings from './countMeetings'
import countMeetingsFacilitated from './countMeetingsFacilitated'
import countNewPages from './countNewPages'
import countNewTasks from './countNewTasks'
import countStandupResponses from './countStandupResponses'
import countTasksPushed from './countTasksPushed'
import countTeamsLed from './countTeamsLed'
import countTeamsThatMet from './countTeamsThatMet'
import findLastMeeting from './findLastMeeting'
import findLastSeen from './findLastSeen'
import medianDaysToDone from './medianDaysToDone'
import readActiveShare from './readActiveShare'
import readActiveUsers from './readActiveUsers'
import readHealthScore from './readHealthScore'
import readOpenTasks from './readOpenTasks'
import readSpend from './readSpend'
import readUserIntegrations from './readUserIntegrations'
import readUsers from './readUsers'

const reportMeasures: Record<ReportMeasure, ReportMeasureFunction> = {
  ACTIVE_USERS: readActiveUsers,
  USERS: readUsers,
  ACTIVE_SHARE: readActiveShare,
  LAST_SEEN: findLastSeen,
  TEAMS_LED: countTeamsLed,
  INVITATIONS: countInvitations,
  MEETINGS: countMeetings,
  MEETINGS_FACILITATED: countMeetingsFacilitated,
  STANDUP_RESPONSES: countStandupResponses,
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
  NEW_PAGES: countNewPages,
  HEALTH_SCORE: readHealthScore,
  SPEND: readSpend
}

export default reportMeasures
