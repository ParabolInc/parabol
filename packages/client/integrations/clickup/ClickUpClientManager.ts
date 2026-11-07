import type Atmosphere from '../../Atmosphere'
import {OAUTH_LOCAL_STORAGE_KEY} from '../../components/AuthProvider'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from '../../utils/getOAuthPopupFeatures'
import makeHref from '../../utils/makeHref'

const AUTHORIZE_URL = 'https://app.clickup.com/api'
const REDIRECT_PATH = '/auth/clickup'
const POLLING_INTERVAL = 250
const POPUP_LIFETIME = 2 * 60 * 1000

const ClickUpClientManager = {
  openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    provider: {id: string; clientId: string},
    mutationProps: MenuMutationProps
  ) {
    const {id: providerId, clientId} = provider
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({hash, origin: window.location.origin, service: 'clickup'})
    )
    const url = new URL(AUTHORIZE_URL)
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('state', providerState)
    url.searchParams.set('redirect_uri', makeHref(REDIRECT_PATH))
    const popup = window.open(
      url.toString(),
      'ClickUpAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    const cleanup = () => {
      clearInterval(pollingIntervalId)
      window.removeEventListener('message', messageHandler)
    }

    const processOAuthData = (data: {code: string; state: string}) => {
      if (submitting) return
      const {code, state} = data
      if (state !== providerState || typeof code !== 'string') return
      localStorage.removeItem(OAUTH_LOCAL_STORAGE_KEY)
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: code, teamId},
        {onError, onCompleted}
      )
      popup?.close()
      cleanup()
    }

    const messageHandler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin) return
      processOAuthData(event.data)
    }

    const checkLocalStorage = () => {
      const storedData = localStorage.getItem(OAUTH_LOCAL_STORAGE_KEY)
      if (!storedData) return
      try {
        processOAuthData(JSON.parse(storedData))
      } catch (error) {
        console.error('Error checking localStorage for OAuth data:', error)
      }
    }

    window.addEventListener('message', messageHandler)
    const pollingIntervalId = setInterval(checkLocalStorage, POLLING_INTERVAL)
    checkLocalStorage()
    setTimeout(cleanup, POPUP_LIFETIME)
  }
}

export default ClickUpClientManager
