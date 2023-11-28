import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  gcal: ({gcal}) => !!gcal,
  adHocTeams: ({adHocTeams}) => !!adHocTeams,
  noTemplateLimit: ({noTemplateLimit}) => !!noTemplateLimit,
  signUpDestinationTeam: ({signUpDestinationTeam}) => !!signUpDestinationTeam
}

export default UserFeatureFlags
