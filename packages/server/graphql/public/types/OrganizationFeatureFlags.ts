import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  noAISummary: ({noAISummary}) => !!noAISummary,
  standupAISummary: ({standupAISummary}) => !!standupAISummary,
  promptToJoinOrg: ({promptToJoinOrg}) => !!promptToJoinOrg,
  AIGeneratedDiscussionPrompt: ({AIGeneratedDiscussionPrompt}) => !!AIGeneratedDiscussionPrompt,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  teamInsights: ({teamInsights}) => !!teamInsights,
  oneOnOne: ({oneOnOne}) => !!oneOnOne
}

export default OrganizationFeatureFlags
