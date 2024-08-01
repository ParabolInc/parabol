import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {UpdateIntegrationProviderSuccessResolvers} from '../resolverTypes'

export type UpdateIntegrationProviderSuccessSource = {
  providerId: number
  teamId: string
  userId: string
}

const UpdateIntegrationProviderSuccess: UpdateIntegrationProviderSuccessResolvers = {
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  },

  teamMember: ({teamId, userId}, _args, {dataLoader}) => {
    const teamMemberId = TeamMemberId.join(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },

  user: async ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default UpdateIntegrationProviderSuccess
