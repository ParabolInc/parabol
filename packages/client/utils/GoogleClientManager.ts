import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'
import getAnonymousId from './getAnonymousId'
import {LocalStorageKey} from '../types/constEnums'
import GoogleManager from './GoogleManager'

class GoogleClientManager extends GoogleManager {
  static openOAuth(atmosphere: Atmosphere, mutationProps: MenuMutationProps, loginHint?: string) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random()
      .toString(36)
      .substring(5)
    const redirectURI = makeHref(`/oauth-redirect${window.location.search}`)
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${window.__ACTION__.google}&scope=${GoogleClientManager.SCOPE}&state=${providerState}&login_hint=${loginHint}&redirect_uri=${redirectURI}`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      const segmentId = getAnonymousId()
      const invitationToken = window.localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)
      window.localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      LoginWithGoogleMutation(
        atmosphere,
        {code, segmentId, invitationToken},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GoogleClientManager
