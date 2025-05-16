import Atmosphere from '../Atmosphere'
import {OAUTH_LOCAL_STORAGE_KEY} from '../components/AuthProvider'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class LinearClientManager {
  static SCOPES = 'read,write'
  static AUTH_PATH = '/oauth/authorize'
  static REDIRECT_PATH = '/auth/linear'
  static POLLING_INTERVAL = 250

  static async openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: {id: string; clientId: string; serverBaseUrl: string},
    mutationProps: MenuMutationProps
  ) {
    const {id: providerId, clientId, serverBaseUrl} = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps

    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({hash, origin: window.location.origin, service: 'linear'})
    )

    const redirectUri = makeHref(LinearClientManager.REDIRECT_PATH)

    const url = new URL(LinearClientManager.AUTH_PATH, serverBaseUrl)
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('scope', LinearClientManager.SCOPES)
    url.searchParams.set('state', providerState)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('actor', 'application')

    // Open the popup with the target URL directly
    const popup = window.open(
      url.toString(),
      'LinearAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    // Shared handler function for both message events and localStorage polling
    const processOAuthData = (data: {code: string; state: string}) => {
      if (submitting) return

      const {code, state} = data
      if (state !== providerState || typeof code !== 'string') return

      localStorage.removeItem(OAUTH_LOCAL_STORAGE_KEY)

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
      window.removeEventListener('message', messageHandler)
      if (pollingIntervalId) clearInterval(pollingIntervalId)
      localStorage.removeItem(OAUTH_LOCAL_STORAGE_KEY)
    }

    const messageHandler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin) {
        return
      }

      processOAuthData(event.data)
    }

    window.addEventListener('message', messageHandler)

    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem(OAUTH_LOCAL_STORAGE_KEY)
        if (!storedData) return

        const data = JSON.parse(storedData)
        processOAuthData(data)
      } catch (error) {
        console.error('Error checking localStorage for OAuth data:', error)
      }
    }

    const pollingIntervalId = setInterval(checkLocalStorage, LinearClientManager.POLLING_INTERVAL)
    checkLocalStorage()
    const cleanup = () => {
      if (pollingIntervalId) clearInterval(pollingIntervalId)
      window.removeEventListener('message', messageHandler)
    }
    setTimeout(cleanup, 2 * 60 * 1000)

    return {
      cancel: () => {
        cleanup()
        popup && popup.close()
      }
    }
  }
}

export default LinearClientManager
