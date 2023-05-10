import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  templateLimit: ({templateLimit}) => !!templateLimit,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  checkoutFlow: ({checkoutFlow}) => !!checkoutFlow,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  gcal: ({gcal}) => !!gcal
}

export default UserFeatureFlags
