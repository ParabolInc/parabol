import {
  getUserId,
  isSuperUser as checkSuperUser,
  isTeamMember as checkTeamMember,
  isUserBillingLeader as checkBillingLeader
} from '../../../utils/authorization'
import AuthToken from '../../../database/types/AuthToken'
import {DataLoaderWorker} from '../../graphql'
import {IntegrationProviderScopesEnum} from '../../../postgres/types/IIntegrationProviderAndToken'
import {AddIntegrationProviderInputT} from '../../types/AddIntegrationProviderInput'
import {UpdateIntegrationProviderInputT} from '../../types/UpdateIntegrationProviderInput'
import linkify from 'parabol-client/utils/linkify'
import {notifyWebhookConfigUpdated} from '../helpers/notifications/notifyMattermost'

export const auth = (
  dataLoader: DataLoaderWorker,
  scope: IntegrationProviderScopesEnum,
  authToken: AuthToken,
  teamId: string | null,
  orgId: string | null
) => {
  const viewerId = getUserId(authToken)
  const isSuperUser = checkSuperUser(authToken)
  const isTeamMember = teamId ? checkTeamMember(authToken, teamId) : false
  const isBillingLeader = orgId ? checkBillingLeader(viewerId, orgId, dataLoader) : false

  switch (scope) {
    case 'global':
      if (!isSuperUser) return new Error('permission denied modifying globally scoped provider')
      break
    case 'org':
      if (!isBillingLeader && !isSuperUser)
        return new Error('permission denied modifying org-wide provider; must be billing leader')
      break
    case 'team':
      if (!isTeamMember && !isBillingLeader && !isSuperUser)
        return new Error('persmission denied modifying team provider; must be team member')
  }

  return
}

export const validate = async (
  provider: AddIntegrationProviderInputT,
  viewerId: string,
  teamId: string,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  switch (provider.scope) {
    case 'global':
      if (provider.tokenType !== 'oauth2')
        return new Error('globally-scoped token provider must be OAuth2 provider')
      break
    // @ts-ignore no-fallthrough
    case 'org':
      if (provider.tokenType !== 'oauth2')
        return new Error('org-scoped token provider must be OAuth2 provider')
    // fall-through and verify team and org
    case 'team':
      const checkTeam = await dataLoader.get('teams').load(teamId)
      if (!checkTeam) return new Error('team not found')
      const checkOrg = await dataLoader.get('organizations').load(orgId)
      if (!checkOrg) return new Error('organization not found')
  }

  switch (provider.tokenType) {
    case 'oauth2':
      if (!provider.oauthScopes) return new Error('scopes required for OAuth2 provider')
      if (!provider.oauthClientId) return new Error('oauthClientId required for OAuth2 provider')
      if (!provider.oauthClientSecret)
        return new Error('oauthClientSecret required for OAuth2 provider')
      break
    case 'pat':
      // nothing to validate
      break
    case 'webhook':
      const links = linkify.match(provider.serverBaseUri)
      if (!links || links.length === 0) return new Error('invalid webhook url')
  }

  // TODO: refactor to use MakeIntegrationServerManager.fromProviderId(...)
  //       and support pat, oauth2, and webhooks here. Method should be shared
  //       with addIntegrationToken implementation. See addIntegrationToken for
  //       inspriation.
  switch (provider.type) {
    case 'mattermost':
      const result = await notifyWebhookConfigUpdated(provider.serverBaseUri, viewerId, teamId)
      if (result instanceof Error) return result
  }

  return
}

export const makeDbIntegrationProvider = (
  provider: AddIntegrationProviderInputT | UpdateIntegrationProviderInputT
) => ({
  oauthScopes: [],
  oauthClientId: null,
  oauthClientSecret: null,
  ...('id' in provider
    ? (({id: _, ...providerWithoutId}) => providerWithoutId)(provider)
    : provider),
  type: provider.type,
  scope: provider.scope,
  tokenType: provider.tokenType,
  isActive: true
})
