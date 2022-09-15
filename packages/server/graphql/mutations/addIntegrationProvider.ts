import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import upsertIntegrationProvider from '../../postgres/queries/upsertIntegrationProvider'
import {isSuperUser, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddIntegrationProviderInput, {
  IAddIntegrationProviderInput
} from '../types/AddIntegrationProviderInput'
import AddIntegrationProviderPayload from '../types/AddIntegrationProviderPayload'

const addIntegrationProvider = {
  name: 'AddIntegrationProvider',
  type: new GraphQLNonNull(AddIntegrationProviderPayload),
  description: 'Adds a new Integration Provider configuration',
  args: {
    input: {
      type: new GraphQLNonNull(AddIntegrationProviderInput),
      description: 'The new Integration Provider'
    }
  },
  resolve: async (
    _source: unknown,
    {
      input
    }: {
      input: IAddIntegrationProviderInput
    },
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const {teamId} = input
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
      return {error: {message: 'Must be on the team for which the provider is created'}}
    }

    // VALIDATION
    const {
      authStrategy,
      oAuth1ProviderMetadataInput,
      oAuth2ProviderMetadataInput,
      webhookProviderMetadataInput,
      ...rest
    } = input

    if (authStrategy === 'oauth1' && !oAuth1ProviderMetadataInput) {
      return {error: {message: 'Auth strategy oauth1 requires oAuth1ProviderMetadataInput'}}
    }
    if (authStrategy === 'oauth2' && !oAuth2ProviderMetadataInput) {
      return {error: {message: 'Auth strategy oauth2 requires oAuth2ProviderMetadataInput'}}
    }
    if (authStrategy === 'webhook' && !webhookProviderMetadataInput) {
      return {error: {message: 'Auth strategy webhook requires webhookProviderMetadataInput'}}
    }
    if (
      [
        oAuth1ProviderMetadataInput,
        oAuth2ProviderMetadataInput,
        webhookProviderMetadataInput
      ].filter(isNotNull).length !== 1
    ) {
      return {error: {message: 'Exactly 1 metadata provider is expected'}}
    }

    // RESOLUTION
    const providerId = await upsertIntegrationProvider({
      authStrategy,
      ...rest,
      ...oAuth1ProviderMetadataInput,
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput
    })

    //TODO: add proper subscription scope handling here, teamId only exists in provider with team scope
    const data = {teamId, providerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationProviderSuccess', data, subOptions)
    return data
  }
}

export default addIntegrationProvider
