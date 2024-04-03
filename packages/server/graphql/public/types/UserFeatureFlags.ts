import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  retrosInDisguise: ({retrosInDisguise}) => !!retrosInDisguise,
  adHocTeams: ({adHocTeams}) => !!adHocTeams,
  noTemplateLimit: ({noTemplateLimit}) => !!noTemplateLimit,
  signUpDestinationTeam: ({signUpDestinationTeam}) => !!signUpDestinationTeam
}

export default UserFeatureFlags
