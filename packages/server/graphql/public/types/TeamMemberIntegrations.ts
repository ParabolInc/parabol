import {TeamMemberIntegrationsResolvers} from '../resolverTypes'

export type TeamMemberIntegrationsSource = {
  teamId: string
  userId: string
}

const TeamMemberIntegrations: TeamMemberIntegrationsResolvers = {
  gcal: async ({teamId, userId}) => {
    return {teamId, userId}
  }
}

export default TeamMemberIntegrations
