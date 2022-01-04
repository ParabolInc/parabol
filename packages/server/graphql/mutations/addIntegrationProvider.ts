import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import insertIntegrationProvider from '../../postgres/queries/insertIntegrationProvider'
import upsertIntegrationToken from '../../postgres/queries/upsertIntegrationToken'
import {createIntegrationProviderInsertParams} from '../../postgres/types/IntegrationProvider'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddIntegrationProviderInput from '../types/AddIntegrationProviderInput'
import AddIntegrationProviderPayload from '../types/AddIntegrationProviderPayload'
import {IntegrationProviderTokenInput} from '../types/AddIntegrationTokenInput'
import validateNewIntegrationAuthToken from './helpers/addIntegrationTokenValidation'
import {
  checkAuthPermissions,
  validateIntegrationProvider
} from './helpers/integrationProviderHelpers'

type AddIntegrationProviderVariables = {
  providerInput: any
  tokenInput: any | null
}

const addIntegrationProvider = {
  name: 'AddIntegrationProvider',
  type: new GraphQLNonNull(AddIntegrationProviderPayload),
  description: 'Adds a new Integration Provider configuration',
  args: {
    providerInput: {
      type: new GraphQLNonNull(AddIntegrationProviderInput),
      description: 'The new Integration Provider'
    },
    tokenInput: {
      type: IntegrationProviderTokenInput,
      description: 'An optional token to add along with the new provider'
    }
  },
  resolve: async (
    _source: unknown,
    {providerInput, tokenInput}: AddIntegrationProviderVariables,
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = providerInput
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const permissionsCheckResult = checkAuthPermissions(
      dataLoader,
      providerInput.scope,
      authToken,
      teamId,
      orgId
    )
    if (permissionsCheckResult instanceof Error) return standardError(permissionsCheckResult)

    // VALIDATION
    const validationResult = await validateIntegrationProvider(providerInput, viewerId, dataLoader)
    if (validationResult instanceof Error) return standardError(validationResult)

    // RESOLUTION
    const {scope} = providerInput
    if (scope === 'global') return {error: {message: 'No global scope adding allowed'}}
    const newIntegrationProvider = createIntegrationProviderInsertParams(providerInput)
    const providerId = await insertIntegrationProvider(newIntegrationProvider)
    if (tokenInput) {
      const tokenValidationResult = validateNewIntegrationAuthToken(
        tokenInput,
        newIntegrationProvider
      )
      if (tokenValidationResult instanceof Error) return standardError(tokenValidationResult)
      await upsertIntegrationToken({
        providerId,
        teamId,
        userId: viewerId,
        tokenMetadata: tokenInput
      })
    }

    //TODO: add proper subscription scope handling here, teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddIntegrationProvider', data, subOptions)
    return data
  }
}

export default addIntegrationProvider
