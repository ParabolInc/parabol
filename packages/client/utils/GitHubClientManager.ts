import type Atmosphere from '../Atmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {ConnectProvider} from '../integrations/platform/ClientIntegrationDefinition'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import {Providers} from '../types/constEnums'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'

class GitHubClientManager {
  static SCOPE = Providers.GITHUB_SCOPE

  fetch = window.fetch.bind(window)
  static isAvailable = typeof window !== 'undefined' && !!window.__ACTION__.github
  static openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: Pick<ConnectProvider, 'id' | 'clientId'>,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({
        hash,
        origin: window.location.origin,
        service: 'github'
      })
    )
    // GitHub sends the code to the callback URL registered on the OAuth app
    const uri = `https://github.com/login/oauth/authorize?client_id=${provider.clientId}&scope=${GitHubClientManager.SCOPE}&state=${providerState}`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {providerId: provider.id, oauthCodeOrPat: code, teamId, includeGitHub: true},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GitHubClientManager
