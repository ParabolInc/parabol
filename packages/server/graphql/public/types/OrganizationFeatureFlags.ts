import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  suggestGroups: ({suggestGroups}) => !!suggestGroups
}

export default OrganizationFeatureFlags
