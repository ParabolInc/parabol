import {GraphQLNonNull} from 'graphql'
import AddIntegrationProviderPayload from '../types/AddIntegrationProviderPayload'
import {GQLContext} from '../graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../utils/publish'
import AddIntegrationProviderInput, {
  AddIntegrationProviderInputT
} from '../types/AddIntegrationProviderInput'
import {
  IntegrationProviderTokenInput,
  IntegrationProviderTokenInputT
} from '../types/AddIntegrationTokenInput'
import upsertGlobalIntegrationProvider from '../../postgres/queries/upsertGlobalIntegrationProvider'
import insertIntegrationProvider from '../../postgres/queries/insertIntegrationProvider'
import insertIntegrationProviderWithToken from '../../postgres/queries/insertIntegrationProviderWithToken'
import addIntegrationTokenValidation from './helpers/addIntegrationTokenValidation'
import {auth, validate, makeDbIntegrationProvider} from './helpers/integrationProviderHelpers'

type AddIntegrationProviderVariables = {
  provider: AddIntegrationProviderInputT
  token?: IntegrationProviderTokenInputT
}

const addIntegrationProvider = {
  name: 'AddIntegrationProvider',
  type: new GraphQLNonNull(AddIntegrationProviderPayload),
  description: 'Adds a new Integration Provider configuration',
  args: {
    provider: {
      type: new GraphQLNonNull(AddIntegrationProviderInput),
      description: 'The new Integration Provider'
    },
    token: {
      type: IntegrationProviderTokenInput,
      description: 'An optional token to add along with the new provider'
    }
  },
  resolve: async (
    _source,
    {provider, token: maybeToken}: AddIntegrationProviderVariables,
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = provider
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const authResult = auth(dataLoader, provider.scope, authToken, teamId, orgId)
    if (authResult instanceof Error) return standardError(authResult)

    // VALIDATION
    const validationResult = await validate(provider, viewerId, teamId, orgId, dataLoader)
    if (validationResult instanceof Error) return standardError(validationResult)

    const dbProvider = makeDbIntegrationProvider(provider)

    if (maybeToken) {
      const maybeTokenError = addIntegrationTokenValidation(maybeToken, dbProvider)
      if (maybeTokenError instanceof Error) return standardError(maybeTokenError)
    }

    // RESOLUTION
    switch (provider.scope) {
      case 'global':
        await upsertGlobalIntegrationProvider(dbProvider)
        break
      case 'org':
      case 'team':
        if (maybeToken) {
          const dbToken = {
            teamId: provider.teamId,
            userId: viewerId,
            accessToken: null,
            expiresAt: null,
            oauthRefreshToken: null,
            oauthScopes: [],
            attributes: {},
            ...maybeToken
          }
          await insertIntegrationProviderWithToken(dbProvider, dbToken)
        } else {
          await insertIntegrationProvider(dbProvider)
        }
    }

    //TODO: add proper subscription scope handling here,
    //      teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationProvider', data, subOptions)
    return data
  }
}

export default addIntegrationProvider
