import {TeamMemberIntegrationsResolvers} from '../resolverTypes'

const TeamMemberIntegrations: TeamMemberIntegrationsResolvers = {
  gcal: (_source) => {
    return _source
  }
}

export default TeamMemberIntegrations
