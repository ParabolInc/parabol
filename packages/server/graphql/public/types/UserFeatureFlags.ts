import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  checkoutFlow: ({checkoutFlow}) => !!checkoutFlow,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  canViewTeamsInDomain: ({canViewTeamsInDomain}) => !!canViewTeamsInDomain, // careful with this flag. They will see all teams in their domain
  gcal: ({gcal}) => !!gcal
}

export default UserFeatureFlags
