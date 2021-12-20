import {
  IntegrationProviderScopesEnum,
  IntegrationProviderTokenTypeEnum
} from '~/__generated__/GitLabProviderRow_viewer.graphql'
import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddIntegrationTokenMutation from '../mutations/AddIntegrationTokenMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

export interface GitLabIntegrationProvider {
  id: string
  name: string
  scope: IntegrationProviderScopesEnum
  tokenType: IntegrationProviderTokenTypeEnum
  updatedAt: string
  providerMetadata: {
    clientId?: string
    serverBaseUrl?: string
    scopes?: ReadonlyArray<string>
  }
}

class GitLabClientManager {
  fetch = window.fetch.bind(window)

  static openOAuth(
    atmosphere: Atmosphere,
    provider: GitLabIntegrationProvider,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {
      id: providerId,
      providerMetadata: {clientId, serverBaseUrl, scopes}
    } = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const oauthScopes = scopes ? scopes.join(' ') : ''
    const providerState = Math.random().toString(36).substring(5)

    const redirect_uri = makeHref('/auth/gitlab')
    const uri = `${serverBaseUrl}/oauth/authorize?client_id=${clientId}&scope=${oauthScopes}&state=${providerState}&redirect_uri=${redirect_uri}&response_type=code`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddIntegrationTokenMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: code, teamId, redirectUri: redirect_uri},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }

  static getPrimaryProvider(providerList: readonly GitLabIntegrationProvider[]) {
    return providerList.find(
      (provider) => provider.scope === 'global' && provider.tokenType === 'oauth2'
    )
  }

  static getSecondaryProvider(providerList: readonly GitLabIntegrationProvider[]) {
    const scopeScore = {
      global: 0,
      org: 1,
      team: 2
    }
    const sortedProviders = providerList
      .filter((provider) => provider.scope != 'global' && provider.tokenType === 'oauth2')
      .map((provider) => ({
        ...provider,
        score: scopeScore[provider.scope]
      }))
      .sort((a, b) => {
        const scoreCompare = b.score - a.score
        if (scoreCompare !== 0) return scoreCompare
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
    if (sortedProviders.length === 0) return null
    return sortedProviders[0]
  }

  static getTruncatedProviderName(name: string) {
    return name.length > 15 ? `${name.slice(0, 15)}…` : name
  }
}

export default GitLabClientManager
