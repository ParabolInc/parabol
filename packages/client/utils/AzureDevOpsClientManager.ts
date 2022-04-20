import {CreateAzureDevOpsAuthorizeUrlMutationResponse} from '~/__generated__/CreateAzureDevOpsAuthorizeUrlMutation.graphql'
import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import CreateAzureDevOpsAuthorizeUrlMutation from '../mutations/CreateAzureDevOpsAuthorizeUrlMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class AzureDevOpsClientManager {
  fetch = window.fetch.bind(window)
  static generateVerifier(): string {
    const array = new Uint32Array(28)
    window.crypto.getRandomValues(array)
    return Array.from(array, (item) => `0${item.toString(16)}`.substr(-2)).join('')
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
    providerId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const verifier = AzureDevOpsClientManager.generateVerifier()
    const code = await AzureDevOpsClientManager.generateCodeChallenge(verifier)
    const redirect = makeHref('/auth/ado')

    // Open synchronously because of Safari
    const popup = window.open(
      '',
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    const onUrlCompleted = (result: CreateAzureDevOpsAuthorizeUrlMutationResponse) => {
      if (popup) {
        if (!result.createAzureDevOpsAuthorizeUrl?.url) {
          onError(result.createAzureDevOpsAuthorizeUrl?.error)
          popup.close()
          return
        }
        popup.location.href = result.createAzureDevOpsAuthorizeUrl.url
      }
    }

    CreateAzureDevOpsAuthorizeUrlMutation(
      atmosphere,
      {providerId, teamId, providerState, redirect, code},
      {onCompleted: onUrlCompleted}
    )

    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }

      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {
          providerId: providerId,
          oauthCodeOrPat: code,
          oauthVerifier: verifier,
          redirectUri: redirect,
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
