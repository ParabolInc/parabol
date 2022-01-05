import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddIntegrationTokenMutation from '../mutations/AddIntegrationTokenMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class GitLabClientManager {
  static SCOPES = 'read_api'
  static openOAuth(
    atmosphere: Atmosphere,
    providerId: string,
    clientId: string,
    serverBaseUrl: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random()
      .toString(36)
      .substring(5)

    const redirect_uri = makeHref('/auth/gitlab')
    const uri = `${serverBaseUrl}/oauth/authorize?client_id=${clientId}&scope=${GitLabClientManager.SCOPES}&state=${providerState}&redirect_uri=${redirect_uri}&response_type=code`

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
      AddIntegrationTokenMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: code, teamId, redirectUri: redirect_uri},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GitLabClientManager
