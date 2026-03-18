import type {RouterProps} from 'react-router'
import type Atmosphere from '../Atmosphere'
import {AUTH_DIALOG_WIDTH} from '../components/AuthenticationDialog'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import LoginWithGoogleMutation from '../mutations/LoginWithGoogleMutation'
import ReAuthWithGoogleMutation from '../mutations/ReAuthWithGoogleMutation'
import {LocalStorageKey} from '../types/constEnums'
import GoogleManager from './GoogleManager'
import getAnonymousId from './getAnonymousId'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

type ReAuthMutationProps = Pick<
  MenuMutationProps,
  'onError' | 'onCompleted' | 'submitMutation' | 'submitting'
>

class GoogleClientManager extends GoogleManager {
  fetch = window.fetch.bind(window)

  private static startOAuthFlow(
    uri: string,
    providerState: string,
    mutationProps: ReAuthMutationProps,
    getOffsetTop: (() => number) | undefined,
    onCode: (code: string, pseudoId: string | undefined, popup: Window | null) => void
  ) {
    const {submitting, onError, submitMutation} = mutationProps
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
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting)
        return
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      window.clearInterval(closeCheckerId)
      window.removeEventListener('message', handler)
      const pseudoId = await getAnonymousId()
      onCode(code, pseudoId, popup)
    }
    window.addEventListener('message', handler)
  }

  static openOAuth(
    atmosphere: Atmosphere,
    mutationProps: MenuMutationProps,
    history: RouterProps['history'],
    pageParams: string,
    invitationToken?: string,
    loginHint?: string,
    getOffsetTop?: () => number
  ) {
    const {onError, onCompleted} = mutationProps
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
    GoogleClientManager.startOAuthFlow(
      uri,
      providerState,
      mutationProps,
      getOffsetTop,
      (code, pseudoId, popup) => {
        window.localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
        const handleComplete: typeof onCompleted = (...args) => {
          popup && popup.close()
          onCompleted(...args)
        }
        LoginWithGoogleMutation(
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
      }
    )
  }

  static openReAuth(
    atmosphere: Atmosphere,
    mutationProps: ReAuthMutationProps,
    onReAuthSuccess: () => void,
    getOffsetTop?: () => number
  ) {
    const {onError, onCompleted} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const params = new URLSearchParams({
      client_id: window.__ACTION__.google,
      scope: GoogleClientManager.SCOPE,
      redirect_uri: makeHref(`/auth/google`),
      response_type: 'code',
      state: providerState,
      prompt: 'select_account'
    })
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    GoogleClientManager.startOAuthFlow(
      uri,
      providerState,
      mutationProps,
      getOffsetTop,
      (code, pseudoId, popup) => {
        ReAuthWithGoogleMutation(atmosphere, {code, pseudoId, params: ''}, (error) => {
          popup && popup.close()
          if (error) {
            onError({message: error})
            onCompleted()
          } else {
            onCompleted()
            onReAuthSuccess()
          }
        })
      }
    )
  }
}

export default GoogleClientManager
