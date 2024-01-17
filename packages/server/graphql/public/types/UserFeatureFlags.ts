import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  adHocTeams: ({adHocTeams}) => !!adHocTeams,
  noTemplateLimit: ({noTemplateLimit}) => !!noTemplateLimit,
  signUpDestinationTeam: ({signUpDestinationTeam}) => !!signUpDestinationTeam,
  recurringRetros: ({recurringRetros}) => !!recurringRetros
}

export default UserFeatureFlags
