import {GraphQLSchema} from 'graphql'
import {IntegrationProviderGitLabOAuth2} from '../../postgres/queries/getIntegrationProvidersByIds'
import {GQLContext} from '../graphql'
import gitlabSchema from '../nestedSchema/GitLab/gitlabSchema.graphql'
import nestGitLabEndpoint from '../nestedSchema/nestGitLabEndpoint'

export const nestGitLab = (parentSchema: GraphQLSchema) =>
  nestGitLabEndpoint({
    parentSchema,
    parentType: 'GitLabIntegration',
    fieldName: 'api',
    resolveEndpointContext: async (
      {teamId, userId}: {teamId: string; userId: string},
      _args,
      {dataLoader}: GQLContext
    ) => {
      const token = await dataLoader.get('freshGitlabAuth').load({teamId, userId})
      if (!token) throw new Error('No GitLab token found')
      const {accessToken, providerId} = token
      const provider = await dataLoader.get('integrationProviders').load(providerId)
      if (!provider) throw new Error('No GitLab provider found')
      const {serverBaseUrl} = provider as IntegrationProviderGitLabOAuth2
      return {
        accessToken: accessToken!,
        baseUri: serverBaseUrl,
        dataLoaderOptions: {maxBatchSize: 5}
      }
    },
    prefix: '_xGitLab',
    schemaIDL: gitlabSchema
  })
