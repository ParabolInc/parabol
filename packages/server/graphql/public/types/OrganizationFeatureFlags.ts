import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  noAISummary: ({noAISummary}) => !!noAISummary,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamHealth: ({teamHealth}) => !!teamHealth,
  teamsLimit: ({teamsLimit}) => !!teamsLimit
}

export default OrganizationFeatureFlags
