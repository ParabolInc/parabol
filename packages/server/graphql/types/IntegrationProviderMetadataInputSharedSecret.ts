import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

export interface IIntegrationProviderMetadataInputSharedSecret {
  serverBaseUrl: string
  sharedSecret: string
}
export const IntegrationProviderMetadataInputSharedSecret = new GraphQLInputObjectType({
  name: 'IntegrationProviderMetadataInputSharedSecret',
  description: 'Webhook provider metadata',
  fields: () => ({
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL used to access the provider'
    },
    sharedSecret: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Shared secret between Parabol and the provider'
    }
  })
})

export default IntegrationProviderMetadataInputSharedSecret
