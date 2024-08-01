import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import upsertIntegrationProvider from '../../postgres/queries/upsertIntegrationProvider'
import {getUserId, isSuperUser, isTeamMember, isUserOrgAdmin} from '../../utils/authorization'
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
    const {teamId, orgId, scope} = input
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isSuperUser(authToken)) {
      if (scope === 'global') {
        return {error: {message: 'Must be a super user to add a global provider'}}
      }
      if (scope === 'org' && !isUserOrgAdmin(viewerId, orgId!, dataLoader)) {
        return {
          error: {
            message:
              'Must be an organization admin to add an integration provider on organization level'
          }
        }
      }
      if (scope === 'team' && !isTeamMember(authToken, teamId!)) {
        return {error: {message: 'Must be on the team for the integration provider'}}
      }
    }

    // VALIDATION
    if (scope === 'global' && (teamId || orgId)) {
      return {error: {message: 'Global providers must not have an `orgId` nor `teamId`'}}
    }
    if (scope === 'org' && (!orgId || teamId)) {
      return {error: {message: 'Org providers must have an `orgId` and no `teamId`'}}
    }
    if (scope === 'team' && (!teamId || orgId)) {
      return {error: {message: 'Team providers must have a `teamId` and no `orgId`'}}
    }

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

    const resolvedOrgId =
      orgId || (teamId ? (await dataLoader.get('teams').loadNonNull(teamId)).orgId : null)

    // RESOLUTION
    const providerId = await upsertIntegrationProvider({
      authStrategy,
      ...rest,
      ...oAuth1ProviderMetadataInput,
      ...oAuth2ProviderMetadataInput,
      ...webhookProviderMetadataInput,
      ...(scope === 'global'
        ? {orgId: null, teamId: null}
        : scope === 'org'
          ? {orgId, teamId: null}
          : {orgId: null, teamId})
    })

    const data = {providerId}
    if (resolvedOrgId) {
      publish(
        SubscriptionChannel.ORGANIZATION,
        resolvedOrgId,
        'AddIntegrationProviderSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default addIntegrationProvider
