import {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'

const getPrevRepoIntegrationRedisKey = (
  teamId: string,
  integrationProviderService: IntegrationProviderServiceEnum
) => `${teamId}:${integrationProviderService}`

export default getPrevRepoIntegrationRedisKey
