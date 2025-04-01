import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class LinearClientManager {
  static SCOPES = 'read,write'
  static AUTH_ENDPOINT = 'https://linear.app/oauth/authorize'
  static REDIRECT_PATH = '/auth/linear'

  static openOAuth(
    atmosphere: Atmosphere,
    clientId: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)

    const redirectUri = makeHref(LinearClientManager.REDIRECT_PATH)
    const uri = `${LinearClientManager.AUTH_ENDPOINT}?client_id=${clientId}&scope=${LinearClientManager.SCOPES}&state=${providerState}&redirect_uri=${redirectUri}&response_type=code&actor=application`

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
      // Verify state and code presence
      if (state !== providerState || typeof code !== 'string') return

      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {
          service: 'linear',
          oauthCodeOrPat: code,
          teamId,
          redirectUri
        },
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default LinearClientManager
