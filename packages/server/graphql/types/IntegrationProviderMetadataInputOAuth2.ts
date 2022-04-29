import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

export interface IIntegrationProviderMetadataInputOAuth2 {
  serverBaseUrl: string
  clientId: string
  clientSecret: string
  tenantId: string
}
export const IntegrationProviderMetadataInputOAuth2 = new GraphQLInputObjectType({
  name: 'IntegrationProviderMetadataInputOAuth2',
  description: 'OAuth2 provider metadata',
  fields: () => ({
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL used to access the provider'
    },
    clientId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client id to give to the provider'
    },
    clientSecret: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client secret to give to the provider'
    },
    tenantId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client secret to give to the provider'
    }
  })
})

export default IntegrationProviderMetadataInputOAuth2
