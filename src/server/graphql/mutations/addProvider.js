import {GraphQLID, GraphQLNonNull} from 'graphql'
import IntegrationService from 'server/graphql/types/IntegrationService'
import addProviderGitHub from 'server/safeMutations/addProviderGitHub'
import addProviderSlack from 'server/safeMutations/addProviderSlack'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {GITHUB, INTEGRATION, SLACK} from 'universal/utils/constants'
import AddProviderPayload from 'server/graphql/types/AddProviderPayload'
import publish from 'server/utils/publish'

export default {
  name: 'AddProvider',
  type: new GraphQLNonNull(AddProviderPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    service: {
      type: new GraphQLNonNull(IntegrationService)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    source,
    {code, service, teamId},
    {authToken, socketId: mutatorId, dataLoader}
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      throw new Error('Don’t be rude.')
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    let data
    if (service === SLACK) {
      data = addProviderSlack(code, teamId, userId)
    } else if (service === GITHUB) {
      data = addProviderGitHub(code, teamId, userId)
    }
    publish(INTEGRATION, teamId, AddProviderPayload, data, subOptions)
    return data
  }
}
