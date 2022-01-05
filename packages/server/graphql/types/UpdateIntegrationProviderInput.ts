import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import IntegrationProviderEditableScopeEnum, {
  TIntegrationProviderEditableScopeEnum
} from './IntegrationProviderEditableScopeEnum'
import IntegrationProviderMetadataInputOAuth2, {
  IIntegrationProviderMetadataInputOAuth2
} from './IntegrationProviderMetadataInputOAuth2'
import IntegrationProviderMetadataInputWebhook, {
  IIntegrationProviderMetadataInputWebhook
} from './IntegrationProviderMetadataInputWebhook'

export interface IUpdateIntegrationProviderInput {
  id: string
  scope: TIntegrationProviderEditableScopeEnum
  webhookProviderMetadataInput: IIntegrationProviderMetadataInputWebhook
  oAuth2ProviderMetadataInput: IIntegrationProviderMetadataInputOAuth2
}

const UpdateIntegrationProviderInput = new GraphQLInputObjectType({
  name: 'UpdateIntegrationProviderInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The the id of the Integration Provider to update'
    },
    scope: {
      type: IntegrationProviderEditableScopeEnum,
      description: 'The new scope for this provider (org, team)'
    },
    webhookProviderMetadataInput: {
      type: IntegrationProviderMetadataInputWebhook,
      description:
        'Webhook provider metadata, has to be non-null if token type is webhook, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    },
    oAuth2ProviderMetadataInput: {
      type: IntegrationProviderMetadataInputOAuth2,
      description:
        'OAuth2 provider metadata, has to be non-null if token type is OAuth2, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    }
  })
})

export default UpdateIntegrationProviderInput
