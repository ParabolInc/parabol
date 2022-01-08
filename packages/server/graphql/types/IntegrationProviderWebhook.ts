import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLURLType from './GraphQLURLType'
import IntegrationProvider, {integrationProviderFields} from './IntegrationProvider'

const IntegrationProviderWebhook = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationProviderWebhook',
  description: 'An integration provider that connects via webhook',
  interfaces: () => [IntegrationProvider],
  isTypeOf: ({authStrategy}) => authStrategy === 'webhook',
  fields: () => ({
    ...integrationProviderFields(),
    webhookUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The webhook URL'
    }
  })
})

export default IntegrationProviderWebhook
