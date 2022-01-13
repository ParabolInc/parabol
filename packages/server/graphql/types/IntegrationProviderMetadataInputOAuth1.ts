import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

export interface IIntegrationProviderMetadataInputOAuth1 {
  serverBaseUrl: string
  consumerKey: string
  privateKey: string
}
export const IntegrationProviderMetadataInputOAuth1 = new GraphQLInputObjectType({
  name: 'IntegrationProviderMetadataInputOAuth1',
  description: 'OAuth1 provider metadata',
  fields: () => ({
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL used to access the provider'
    },
    consumerKey: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client key to give to the provider'
    },
    privateKey: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Private key of the generate private/public key pair'
    }
  })
})

export default IntegrationProviderMetadataInputOAuth1
