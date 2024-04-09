import {OrganizationFeatureFlagsResolvers} from '../resolverTypes'

const OrganizationFeatureFlags: OrganizationFeatureFlagsResolvers = {
  noAISummary: ({noAISummary}) => !!noAISummary,
  standupAISummary: ({standupAISummary}) => !!standupAISummary,
  noPromptToJoinOrg: ({noPromptToJoinOrg}) => !!noPromptToJoinOrg,
  zoomTranscription: ({zoomTranscription}) => !!zoomTranscription,
  shareSummary: ({shareSummary}) => !!shareSummary,
  suggestGroups: ({suggestGroups}) => !!suggestGroups,
  teamsLimit: ({teamsLimit}) => !!teamsLimit,
  noTeamInsights: ({noTeamInsights}) => !!noTeamInsights,
  publicTeams: ({publicTeams}) => !!publicTeams,
  singleColumnStandups: ({singleColumnStandups}) => !!singleColumnStandups,
  kudos: ({kudos}) => !!kudos,
  aiIcebreakers: ({aiIcebreakers}) => !!aiIcebreakers,
  aiTemplate: ({aiTemplate}) => !!aiTemplate,
  recurringRetros: ({recurringRetros}) => !!recurringRetros,
  relatedDiscussions: ({relatedDiscussions}) => !!relatedDiscussions
}

export default OrganizationFeatureFlags
