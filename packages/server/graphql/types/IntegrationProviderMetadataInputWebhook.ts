import {GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

export interface IIntegrationProviderMetadataInputWebhook {
  webhookUrl: string
}
export const IntegrationProviderMetadataInputWebhook = new GraphQLInputObjectType({
  name: 'IntegrationProviderMetadataInputWebhook',
  description: 'Webhook provider metadata',
  fields: () => ({
    webhookUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'Webhook URL to be used by the provider'
    }
  })
})

export default IntegrationProviderMetadataInputWebhook
