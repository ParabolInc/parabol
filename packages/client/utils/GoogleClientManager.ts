import {RouterProps} from 'react-router'
import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import LoginWithGoogleMutation from '../mutations/LoginWithGoogleMutation'
import {LocalStorageKey} from '../types/constEnums'
import getAnonymousId from './getAnonymousId'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import GoogleManager from './GoogleManager'
import makeHref from './makeHref'

class GoogleClientManager extends GoogleManager {
  fetch = window.fetch.bind(window)
  static openOAuth(
    atmosphere: Atmosphere,
    mutationProps: MenuMutationProps,
    history: RouterProps['history'],
    invitationToken?: string,
    loginHint?: string
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const params = new URLSearchParams({
      client_id: window.__ACTION__.google,
      scope: GoogleClientManager.SCOPE,
      redirect_uri: makeHref(`/auth/google`),
      response_type: 'code',
      state: providerState,
      prompt: 'select_account',
      login_hint: loginHint ?? ''
    })
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    submitMutation()
    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 356, height: 530, top: 56})
    )
    const closeCheckerId = window.setInterval(() => {
      if (popup && popup.closed) {
        onError({message: 'Error logging in! Did you close the popup?'})
        window.clearInterval(closeCheckerId)
        window.removeEventListener('message', handler)
      }
    }, 100)
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      window.clearInterval(closeCheckerId)
      const segmentId = getAnonymousId()
      window.localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      const handleComplete = (...args) => {
        popup && popup.close()
        onCompleted(...args)
      }
      LoginWithGoogleMutation(
        atmosphere,
        {code, segmentId, invitationToken: invitationToken || '', isInvitation: !!invitationToken},
        {onError, onCompleted: handleComplete, history}
      )
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GoogleClientManager
