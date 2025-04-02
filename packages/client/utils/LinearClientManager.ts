import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class LinearClientManager {
  static SCOPES = 'read,write'
  static AUTH_PATH = '/oauth/authorize'
  static REDIRECT_PATH = '/auth/linear'

  static async openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: {id: string; clientId: string; serverBaseUrl: string},
    mutationProps: MenuMutationProps
  ) {
    const {id: providerId, clientId, serverBaseUrl} = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const redirectUri = makeHref(LinearClientManager.REDIRECT_PATH)
    const urlObj = new URL(LinearClientManager.AUTH_PATH, serverBaseUrl)
    urlObj.searchParams.set('client_id', clientId)
    urlObj.searchParams.set('scope', LinearClientManager.SCOPES)
    urlObj.searchParams.set('state', providerState)
    urlObj.searchParams.set('redirect_uri', redirectUri)
    urlObj.searchParams.set('response_type', 'code')
    urlObj.searchParams.set('actor', 'application')
    const url = urlObj.toString()

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
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {
          providerId,
          oauthCodeOrPat: code,
          redirectUri,
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

export default LinearClientManager
