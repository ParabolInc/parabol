import {RouterProps} from 'react-router'
import Atmosphere from '../Atmosphere'
import {AUTH_DIALOG_WIDTH} from '../components/AuthenticationDialog'
import {MenuMutationProps} from '../hooks/useMutationProps'
import LoginWithMicrosoftMutation from '../mutations/LoginWithMicrosoftMutation'
import {LocalStorageKey} from '../types/constEnums'
import MicrosoftManager from './MicrosoftManager'
import getAnonymousId from './getAnonymousId'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class MicrosoftClientManager extends MicrosoftManager {
  fetch = window.fetch.bind(window)
  static openOAuth(
    atmosphere: Atmosphere,
    mutationProps: MenuMutationProps,
    history: RouterProps['history'],
    pageParams: string,
    invitationToken?: string,
    loginHint?: string,
    getOffsetTop?: () => number
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const params = new URLSearchParams({
      client_id: window.__ACTION__.microsoft,
      scope: MicrosoftClientManager.SCOPE,
      redirect_uri: makeHref(`/auth/microsoft`),
      response_type: 'code',
      state: providerState,
      prompt: 'select_account',
      login_hint: loginHint ?? ''
    })
    const uri = `https://login.microsoftonline.com/${
      window.__ACTION__.microsoftTenantId
    }/oauth2/v2.0/authorize?${params.toString()}`
    submitMutation()
    const top = getOffsetTop?.() || 56
    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: AUTH_DIALOG_WIDTH, height: 576, top})
    )
    const closeCheckerId = window.setInterval(() => {
      if (popup && popup.closed) {
        onError({message: 'Error logging in! Did you close the popup?'})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    const handler = async (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      window.clearInterval(closeCheckerId)
      const pseudoId = await getAnonymousId()
      window.localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      const handleComplete: typeof onCompleted = (...args) => {
        popup && popup.close()
        onCompleted(...args)
      }
      LoginWithMicrosoftMutation(
        atmosphere,
        {
          code,
          pseudoId,
          invitationToken: invitationToken || '',
          isInvitation: !!invitationToken,
          params: pageParams
        },
        {onError, onCompleted: handleComplete, history}
      )
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default MicrosoftClientManager
