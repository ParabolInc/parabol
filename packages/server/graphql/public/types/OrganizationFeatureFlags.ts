import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  noAISummary: ({noAISummary}) => !!noAISummary,
  shareSummary: ({shareSummary}) => !!shareSummary
}

export default OrganizationFeatureFlags
