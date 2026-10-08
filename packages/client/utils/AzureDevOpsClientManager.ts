import type Atmosphere from '../Atmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {expectAzureDevOpsProjectChoice} from '../integrations/azureDevOps/azureDevOpsProjectChoice'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import azureDevOpsOAuthScope from '../shared/integrations/azureDevOpsOAuthScope'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class AzureDevOpsClientManager {
  static generateVerifier(): string {
    const array = new Uint32Array(28)
    window.crypto.getRandomValues(array)
    return Array.from(array, (item) => `0${item.toString(16)}`.substr(-2)).join('')
  }

  static getInstanceId = (url: URL) => {
    const index = url.pathname.indexOf('/', 1)
    return url.hostname + url.pathname.substring(0, index)
  }

  static async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier)
    )

    return window
      .btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  static async openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: {
      id: string
      tenantId: string | null | undefined
      clientId: string
    },
    mutationProps: MenuMutationProps
  ) {
    const {id: providerId, tenantId, clientId} = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const verifier = AzureDevOpsClientManager.generateVerifier()
    const code = await AzureDevOpsClientManager.generateCodeChallenge(verifier)
    const redirect = makeHref('/auth/ado2')
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirect,
      response_mode: 'query',
      scope: azureDevOpsOAuthScope,
      state: providerState,
      code_challenge: code,
      code_challenge_method: 'S256'
    })
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`

    // Open synchronously because of Safari
    const popup = window.open(
      '',
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    if (popup) {
      popup.location.href = url
    }

    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }

      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      expectAzureDevOpsProjectChoice(teamId)
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {
          providerId,
          oauthCodeOrPat: code,
          oauthVerifier: verifier,
          teamId
        },
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}
export default AzureDevOpsClientManager
