import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class GcalClientManager {
  static SCOPES = 'https://www.googleapis.com/auth/calendar.events'
  static openOAuth(
    atmosphere: Atmosphere,
    providerId: string,
    clientId: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const redirectUri = makeHref('/auth/gcal')
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&scope=${GcalClientManager.SCOPES}&state=${providerState}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&prompt=consent`

    const popup = window.open(
      uri,
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: code, teamId, redirectUri},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GcalClientManager
