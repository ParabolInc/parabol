import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  noAISummary: ({noAISummary}) => !!noAISummary,
  standupAISummary: ({standupAISummary}) => !!standupAISummary,
  noPromptToJoinOrg: ({noPromptToJoinOrg}) => !!noPromptToJoinOrg,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  publicTeams: ({publicTeams}) => !!publicTeams,
  singleColumnStandups: ({singleColumnStandups}) => !!singleColumnStandups,
  aiTemplate: ({aiTemplate}) => !!aiTemplate,
  relatedDiscussions: ({relatedDiscussions}) => !!relatedDiscussions
}

export default OrganizationFeatureFlags
