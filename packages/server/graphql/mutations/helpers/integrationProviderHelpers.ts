import {
  getUserId,
  isSuperUser as checkSuperUser,
  isTeamMember as checkTeamMember,
  isUserBillingLeader as checkBillingLeader
} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import AuthToken from '../../../database/types/AuthToken'
import {DataLoaderWorker} from '../../graphql'
import {
  IntegrationProvidersEnum as IntegrationProvidersEnumT,
  IntegrationProviderScopesEnum as IntegrationProviderScopesEnumT,
  IntegrationProviderTokenTypeEnum as IntegrationProviderTokenTypeEnumT
} from '../../../types/IntegrationProviderAndTokenT'
import {AddIntegrationProviderInputT} from '../../types/AddIntegrationProviderInput'
import {UpdateIntegrationProviderInputT} from '../../types/UpdateIntegrationProviderInput'

export const auth = (
  provider: AddIntegrationProviderInputT,
  authToken: AuthToken,
  teamId: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const viewerId = getUserId(authToken)
  const isSuperUser = checkSuperUser(authToken)
  const isTeamMember = checkTeamMember(authToken, teamId)
  const isBillingLeader = checkBillingLeader(viewerId, orgId, dataLoader)

  switch (provider.providerScope) {
    case 'global':
      if (!isSuperUser)
        return standardError(new Error('permission denied modifying globally scoped provider'))
      break
    case 'org':
      if (!isBillingLeader && !isSuperUser)
        return standardError(
          new Error('permission denied modifying org-wide provider; must be billing leader')
        )
      break
    case 'team':
      if (!isTeamMember && !isBillingLeader && !isSuperUser)
        return standardError(
          new Error('persmission denied modifying team provider; must be team member')
        )
  }

  return
}

export const validate = async (
  provider: AddIntegrationProviderInputT,
  teamId: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  switch (provider.providerScope) {
    case 'global':
      if (provider.providerTokenType !== 'oauth2')
        return standardError(new Error('globally-scoped token provider must be OAuth2 provider'))
      break
    // @ts-ignore fall-through is desired here
    case 'org':
      if (provider.providerTokenType !== 'oauth2')
        return standardError(new Error('org-scoped token provider must be OAuth2 provider'))
    case 'team':
      const checkTeam = await dataLoader.get('teams').load(teamId)
      if (!checkTeam) return standardError(new Error('team not found'))
      const checkOrg = await dataLoader.get('organizations').load(orgId)
      if (!checkOrg) return standardError(new Error('organization not found'))
  }
  switch (provider.providerTokenType) {
    case 'oauth2':
      if (!provider.scopes) return standardError(new Error('scopes required for OAuth2 provider'))
      if (!provider.oauthClientId)
        return standardError(new Error('oauthClientId required for OAuth2 provider'))
      if (!provider.oauthClientSecret)
        return standardError(new Error('oauthClientSecret required for OAuth2 provider'))
      break
    case 'pat':
      // nothing to validate
      break
  }

  return
}

export const makeDbIntegrationProvider = (
  provider: AddIntegrationProviderInputT | UpdateIntegrationProviderInputT
) => ({
  scopes: [],
  oauthClientId: null,
  oauthClientSecret: null,
  ...('id' in provider
    ? (({id: _, ...providerWithoutId}) => providerWithoutId)(provider)
    : provider),
  providerType: provider.providerType.toUpperCase() as IntegrationProvidersEnumT,
  providerScope: provider.providerScope.toUpperCase() as IntegrationProviderScopesEnumT,
  providerTokenType: provider.providerTokenType.toUpperCase() as IntegrationProviderTokenTypeEnumT,
  isActive: true
})
