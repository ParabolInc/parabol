import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  noAISummary: ({noAISummary}) => !!noAISummary,
  noMeetingHistoryLimit: ({noMeetingHistoryLimit}) => !!noMeetingHistoryLimit,
  signUpDestinationTeam: ({signUpDestinationTeam}) => !!signUpDestinationTeam
}

export default UserFeatureFlags
