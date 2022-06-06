import {UserFeatureFlagsResolvers} from '../resolverTypes'

const UserFeatureFlags: UserFeatureFlagsResolvers = {
  standups: ({standups}) => !!standups,
  azureDevOps: ({azureDevOps}) => !!azureDevOps,
  msTeams: ({msTeams}) => !!msTeams,
  insights: ({insights}) => !!insights
}

export default UserFeatureFlags
