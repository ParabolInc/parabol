import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg
}

export default OrganizationFeatureFlags
