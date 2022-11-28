import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddSlackAuthMutation from '../mutations/AddSlackAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import SlackManager from './SlackManager'
class SlackClientManager extends SlackManager {
  fetch = window.fetch.bind(window)
  static openOAuth(atmosphere: Atmosphere, teamId: string, mutationProps: MenuMutationProps) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({hash, origin: window.location.origin, service: 'slack'})
    )
    const redirect = window.__ACTION__.oauth2Redirect
    const uri = `https://slack.com/oauth/v2/authorize?client_id=${window.__ACTION__.slack}&scope=${SlackClientManager.SCOPE}&state=${providerState}&redirect_uri=${redirect}`
    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 600, top: 56})
    )
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddSlackAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default SlackClientManager
