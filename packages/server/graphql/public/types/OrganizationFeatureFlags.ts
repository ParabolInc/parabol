import {OrganizationFeatureFlagsResolvers} from '../resolvers'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  teamsLimit: ({teamsLimit}) => !!teamsLimit
}

export default OrganizationFeatureFlags
