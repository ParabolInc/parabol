import {GraphQLNonNull} from 'graphql'
import AddIntegrationProviderPayload from '../types/AddIntegrationProviderPayload'
import {GQLContext} from '../graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../utils/publish'
import AddIntegrationProviderInput from '../types/AddIntegrationProviderInput'
import insertIntegrationProvider from '../../postgres/queries/insertIntegrationProvider'
import {
  IntegrationProviderTokenInput,
  IntegrationProviderTokenInputT
} from '../types/AddIntegrationTokenInput'
import upsertGlobalIntegrationProvider from '../../postgres/queries/upsertGlobalIntegrationProvider'
import insertIntegrationProviderWithToken from '../../postgres/queries/insertIntegrationProviderWithToken'
import validateNewIntegrationAuthToken from './helpers/addIntegrationTokenValidation'
import {
  checkAuthPermissions,
  validateIntegrationProvider
} from './helpers/integrationProviderHelpers'
import {
  createGlobalIntegrationProviderUpsertParams,
  createIntegrationProviderInsertParams,
  IntegrationProviderInput
} from '../../postgres/types/IntegrationProvider'

export type AddIntegrationProviderInput = Omit<IntegrationProviderInput, 'id'>

type AddIntegrationProviderVariables = {
  provider: AddIntegrationProviderInput
  token: IntegrationProviderTokenInputT | null
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
    _source: unknown,
    {
      provider: integrationProviderInput,
      token: integrationTokenInput
    }: AddIntegrationProviderVariables,
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = integrationProviderInput
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const permissionsCheckResult = checkAuthPermissions(
      dataLoader,
      integrationProviderInput.scope,
      authToken,
      teamId,
      orgId
    )
    if (permissionsCheckResult instanceof Error) return standardError(permissionsCheckResult)

    // VALIDATION
    const validationResult = await validateIntegrationProvider(
      integrationProviderInput,
      viewerId,
      dataLoader
    )
    if (validationResult instanceof Error) return standardError(validationResult)

    // RESOLUTION
    const {scope} = integrationProviderInput
    if (scope === 'global') {
      const upsertParams = createGlobalIntegrationProviderUpsertParams(integrationProviderInput)
      await upsertGlobalIntegrationProvider(upsertParams)
    } else if (scope === 'org' || scope === 'team') {
      const newIntegrationProvider = createIntegrationProviderInsertParams(integrationProviderInput)
      if (integrationTokenInput) {
        const integrationTokenMetadata = integrationTokenInput

        const tokenValidationResult = validateNewIntegrationAuthToken(
          integrationTokenMetadata,
          newIntegrationProvider
        )
        if (tokenValidationResult instanceof Error) return standardError(tokenValidationResult)
        await insertIntegrationProviderWithToken({
          provider: newIntegrationProvider,
          userId: viewerId,
          tokenMetadata: integrationTokenMetadata
        })
      } else {
        await insertIntegrationProvider(newIntegrationProvider)
      }
    }

    //TODO: add proper subscription scope handling here, teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationProvider', data, subOptions)
    return data
  }
}

export default addIntegrationProvider
