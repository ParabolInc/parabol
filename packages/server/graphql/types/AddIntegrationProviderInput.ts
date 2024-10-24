import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import {
  IntegrationProviderAuthStrategyEnum as TIntegrationProviderAuthStrategyEnum,
  IntegrationProviderServiceEnum as TIntegrationProviderServiceEnum
} from '../../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import IntegrationProviderAuthStrategyEnum from './IntegrationProviderAuthStrategyEnum'
import IntegrationProviderEditableScopeEnum, {
  TIntegrationProviderEditableScopeEnum
} from './IntegrationProviderEditableScopeEnum'
import IntegrationProviderMetadataInputOAuth1, {
  IIntegrationProviderMetadataInputOAuth1
} from './IntegrationProviderMetadataInputOAuth1'
import IntegrationProviderMetadataInputOAuth2, {
  IIntegrationProviderMetadataInputOAuth2
} from './IntegrationProviderMetadataInputOAuth2'
import IntegrationProviderMetadataInputSharedSecret, {
  IIntegrationProviderMetadataInputSharedSecret
} from './IntegrationProviderMetadataInputSharedSecret'
import IntegrationProviderMetadataInputWebhook, {
  IIntegrationProviderMetadataInputWebhook
} from './IntegrationProviderMetadataInputWebhook'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'

export interface IAddIntegrationProviderInput {
  teamId: string | null
  orgId: string | null
  service: TIntegrationProviderServiceEnum
  authStrategy: TIntegrationProviderAuthStrategyEnum
  scope: TIntegrationProviderEditableScopeEnum
  webhookProviderMetadataInput: IIntegrationProviderMetadataInputWebhook | null
  oAuth1ProviderMetadataInput: IIntegrationProviderMetadataInputOAuth1 | null
  oAuth2ProviderMetadataInput: IIntegrationProviderMetadataInputOAuth2 | null
  sharedSecretMetadataInput: IIntegrationProviderMetadataInputSharedSecret | null
}

const AddIntegrationProviderInput = new GraphQLInputObjectType({
  name: 'AddIntegrationProviderInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    teamId: {
      type: GraphQLID,
      description: 'The team that the token is linked to'
    },
    orgId: {
      type: GraphQLID,
      description: 'The organization that the token is linked to'
    },
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      description: 'The service this provider is associated with'
    },
    authStrategy: {
      type: new GraphQLNonNull(IntegrationProviderAuthStrategyEnum),
      description: 'The kind of token used by this provider'
    },
    scope: {
      type: new GraphQLNonNull(IntegrationProviderEditableScopeEnum),
      description: 'The scope this provider configuration was created at (org-wide, or by the team)'
    },
    webhookProviderMetadataInput: {
      type: IntegrationProviderMetadataInputWebhook,
      description:
        'Webhook provider metadata, has to be non-null if token type is webhook, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    },
    oAuth1ProviderMetadataInput: {
      type: IntegrationProviderMetadataInputOAuth1,
      description:
        'OAuth1 provider metadata, has to be non-null if token type is OAuth1, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    },
    oAuth2ProviderMetadataInput: {
      type: IntegrationProviderMetadataInputOAuth2,
      description:
        'OAuth2 provider metadata, has to be non-null if token type is OAuth2, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    },
    sharedSecretMetadataInput: {
      type: IntegrationProviderMetadataInputSharedSecret,
      description:
        'Shared secret provider metadata, has to be non-null if token type is shared secret'
    }
  })
})

export default AddIntegrationProviderInput
