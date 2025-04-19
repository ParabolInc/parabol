import TeamMemberIntegrationsId from '../../../../client/shared/gqlIds/TeamMemberIntegrationsId'
import {isTeamMember} from '../../../utils/authorization'
import {TeamMemberIntegrationsResolvers} from '../resolverTypes'

export type TeamMemberIntegrationsSource = {
  teamId: string
  userId: string
}
const TeamMemberIntegrations: TeamMemberIntegrationsResolvers = {
  gcal: async ({teamId, userId}) => {
    return {teamId, userId}
  },

  id: ({teamId, userId}) => TeamMemberIntegrationsId.join(teamId, userId),

  atlassian: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return null
    return dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  },

  jiraServer: (source) => source,

  github: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return null
    return dataLoader.get('githubAuth').load({teamId, userId})
  },

  gitlab: (source) => source,
  mattermost: (source) => source,

  slack: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return null
    const auths = await dataLoader.get('slackAuthByUserId').load(userId)
    return auths.find((auth) => auth.teamId === teamId)!
  },

  azureDevOps: (source) => source,
  msTeams: (source) => source,
  linear: (source) => source
}

export default TeamMemberIntegrations
