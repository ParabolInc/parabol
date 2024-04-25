import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  insights: ({insights}) => !!insights,
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  adHocTeams: ({adHocTeams}) => !!adHocTeams,
  signUpDestinationTeam: ({signUpDestinationTeam}) => !!signUpDestinationTeam
}

export default UserFeatureFlags
