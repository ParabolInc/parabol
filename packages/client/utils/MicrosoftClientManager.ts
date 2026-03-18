import type {RouterProps} from 'react-router'
import type Atmosphere from '../Atmosphere'
import {AUTH_DIALOG_WIDTH} from '../components/AuthenticationDialog'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import LoginWithMicrosoftMutation from '../mutations/LoginWithMicrosoftMutation'
import ReAuthWithMicrosoftMutation from '../mutations/ReAuthWithMicrosoftMutation'
import {LocalStorageKey} from '../types/constEnums'
import getAnonymousId from './getAnonymousId'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import MicrosoftManager from './MicrosoftManager'
import makeHref from './makeHref'

type ReAuthMutationProps = Pick<
  MenuMutationProps,
  'onError' | 'onCompleted' | 'submitMutation' | 'submitting'
>

class MicrosoftClientManager extends MicrosoftManager {
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
    MicrosoftClientManager.startOAuthFlow(
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
      client_id: window.__ACTION__.microsoft,
      scope: MicrosoftClientManager.SCOPE,
      redirect_uri: makeHref(`/auth/microsoft`),
      response_type: 'code',
      state: providerState,
      prompt: 'select_account'
    })
    const uri = `https://login.microsoftonline.com/${
      window.__ACTION__.microsoftTenantId
    }/oauth2/v2.0/authorize?${params.toString()}`
    MicrosoftClientManager.startOAuthFlow(
      uri,
      providerState,
      mutationProps,
      getOffsetTop,
      (code, pseudoId, popup) => {
        ReAuthWithMicrosoftMutation(atmosphere, {code, pseudoId, params: ''}, (error) => {
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

export default MicrosoftClientManager
