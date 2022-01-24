import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertIntegrationProvider from '../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isTeamMember} from '../../utils/authorization'
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
    const viewerId = getUserId(authToken)
    const {teamId} = input
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Must be on the team that created the provider'}}
    }

    // VALIDATION
    const {oAuth2ProviderMetadataInput, webhookProviderMetadataInput, ...rest} = input
    if (oAuth2ProviderMetadataInput && webhookProviderMetadataInput) {
      return {error: {message: 'Provided 2 metadata types, expected 1'}}
    }
    if (!oAuth2ProviderMetadataInput && !webhookProviderMetadataInput) {
      return {error: {message: 'Provided 0 metadata types, expected 1'}}
    }

    // RESOLUTION
    const providerId = await upsertIntegrationProvider({
      ...rest,
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput
    })

    //TODO: add proper subscription scope handling here, teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId, providerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationProviderSuccess', data, subOptions)
    return data
  }
}

export default addIntegrationProvider
