import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  checkoutFlow: ({checkoutFlow}) => !!checkoutFlow,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  canViewTeamsInDomain: ({canViewTeamsInDomain}) => !!canViewTeamsInDomain
}

export default UserFeatureFlags
