import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  noAISummary: ({noAISummary}) => !!noAISummary,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamHealth: ({teamHealth}) => !!teamHealth,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg
}

export default OrganizationFeatureFlags
