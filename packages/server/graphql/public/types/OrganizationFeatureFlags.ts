import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  SAMLUI: ({SAMLUI}) => !!SAMLUI,
  noAISummary: ({noAISummary}) => !!noAISummary,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  teamInsights: ({teamInsights}) => !!teamInsights
}

export default OrganizationFeatureFlags
