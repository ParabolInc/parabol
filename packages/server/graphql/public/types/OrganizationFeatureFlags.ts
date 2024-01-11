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
  publicTeams: ({publicTeams}) => !!publicTeams,
  singleColumnStandups: ({singleColumnStandups}) => !!singleColumnStandups,
  meetingInception: ({meetingInception}) => !!meetingInception,
  kudos: ({kudos}) => !!kudos,
  aiIcebreakers: ({aiIcebreakers}) => !!aiIcebreakers
}

export default OrganizationFeatureFlags
