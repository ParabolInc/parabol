import {
  IntegrationTokenInputT,
  IntegrationProviderTokenInputT
} from '../../types/AddIntegrationTokenInput'
import {IntegrationProvider as IntegrationProviderT} from '../../../types/IntegrationProviderAndTokenT'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import plural from 'parabol-client/utils/plural'

type TokenInputTypes = IntegrationTokenInputT | IntegrationProviderTokenInputT

const isIntegrationTokenInputT = (
  maybeIntegrationTokenInput: TokenInputTypes
): maybeIntegrationTokenInput is IntegrationTokenInputT => {
  return 'providerId' in maybeIntegrationTokenInput && 'teamId' in maybeIntegrationTokenInput
}

const validateTokenInput = (
  maybeInputToken: IntegrationTokenInputT,
  expectedProviderId: IntegrationProviderT['id']
): string[] => {
  const errors: string[] = []
  if (!maybeInputToken.providerId) errors.push('providerId is required')
  else {
    const providerId = IntegrationProviderId.split(maybeInputToken.providerId)
    providerId !== expectedProviderId && errors.push('providerId does not match provider')
  }
  !maybeInputToken.teamId && errors.push('teamId is required')
  return errors
}

const addIntegrationTokenValidation = (
  maybeInputToken: TokenInputTypes,
  providerInfo: {
    id?: IntegrationProviderT['id']
    tokenType: IntegrationProviderT['tokenType']
  }
) => {
  const errors: string[] = []

  if (isIntegrationTokenInputT(maybeInputToken)) {
    if (!providerInfo.id) throw new Error('expected providerInfo.id to validate token')
    errors.push(...validateTokenInput(maybeInputToken, providerInfo.id))
  }

  switch (providerInfo.tokenType) {
    case 'OAUTH2':
    case 'PAT':
      !maybeInputToken.oauthCodeOrPat && errors.push('oauthCodeOrPat is required')
      break
    case 'WEBHOOK':
    // nothing to verify
  }

  if (errors.length)
    return Error(`${plural(errors.length, 'Error')} validating token: ${errors.join(', ')}`)

  return true
}

export default addIntegrationTokenValidation
