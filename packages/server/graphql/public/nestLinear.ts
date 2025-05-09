import {GraphQLSchema} from 'graphql'
import {IntegrationProviderLinear} from '../../postgres/queries/getIntegrationProvidersByIds'
import {GQLContext} from '../graphql'
import linearSchema from '../nestedSchema/Linear/linearSchema.graphql'
import nestLinearEndpoint from '../nestedSchema/nestLinearEndpoint'

export const nestLinear = (parentSchema: GraphQLSchema) =>
  nestLinearEndpoint({
    parentSchema,
    parentType: 'LinearIntegration',
    fieldName: 'api',
    resolveEndpointContext: async (
      {teamId, userId}: {teamId: string; userId: string},
      _args,
      {dataLoader}: GQLContext
    ) => {
      const auth = await dataLoader
        .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
        .load({service: 'linear', teamId, userId})
      if (!auth?.accessToken) throw new Error('No Linear token found')
      if (!auth?.providerId) throw new Error('No Linear provider found')
      const {accessToken, providerId} = auth
      const provider = await dataLoader.get('integrationProviders').load(providerId)
      const {serverBaseUrl} = provider as IntegrationProviderLinear
      return {
        accessToken,
        baseUri: serverBaseUrl
      }
    },
    prefix: '_xLinear',
    schemaIDL: linearSchema
  })
