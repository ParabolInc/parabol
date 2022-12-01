import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddAtlassianAuthMutation from '../mutations/AddAtlassianAuthMutation'
import AtlassianManager, {JiraPermissionScope} from './AtlassianManager'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'

class AtlassianClientManager extends AtlassianManager {
  fetch = window.fetch.bind(window)
  static openOAuth(
    atmosphere: Atmosphere,
    teamId: string,
    mutationProps: MenuMutationProps,
    scopes: JiraPermissionScope[] = AtlassianManager.SCOPE
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const hash = Math.random().toString(36).substring(5)
    const providerState = btoa(
      JSON.stringify({hash, origin: window.location.origin, service: 'atlassian'})
    )
    const redirect = window.__ACTION__.oauth2Redirect
    const uri = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
      window.__ACTION__.atlassian
    }&scope=${encodeURI(
      scopes.join(' ')
    )}&redirect_uri=${redirect}&state=${providerState}&response_type=code&prompt=consent`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 810, top: 56})
    )
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddAtlassianAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default AtlassianClientManager
