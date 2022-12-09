import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  recurrence: ({recurrence}) => !!recurrence,
  templateLimit: ({templateLimit}) => !!templateLimit,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  aiSummary: ({aiSummary}) => !!aiSummary,
  meetingHistoryLimit: ({meetingHistoryLimit}) => !!meetingHistoryLimit
}

export default UserFeatureFlags
