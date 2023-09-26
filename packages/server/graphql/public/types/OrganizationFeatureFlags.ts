import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  noAISummary: ({noAISummary}) => !!noAISummary,
  standupAISummary: ({standupAISummary}) => !!standupAISummary,
  noPromptToJoinOrg: ({noPromptToJoinOrg}) => !!noPromptToJoinOrg,
  AIGeneratedDiscussionPrompt: ({AIGeneratedDiscussionPrompt}) => !!AIGeneratedDiscussionPrompt,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  teamInsights: ({teamInsights}) => !!teamInsights,
  oneOnOne: ({oneOnOne}) => !!oneOnOne,
  singleColumnStandups: ({singleColumnStandups}) => !!singleColumnStandups
}

export default OrganizationFeatureFlags
