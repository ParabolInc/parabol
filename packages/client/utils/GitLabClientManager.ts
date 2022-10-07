import {Providers} from '~/types/constEnums'
import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class GitLabClientManager {
  static SCOPES = Providers.GITLAB_SCOPE
  static openOAuth(
    atmosphere: Atmosphere,
    providerId: string,
    clientId: string,
    serverBaseUrl: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)

    const redirectUri = makeHref('/auth/gitlab')
    const uri = `${serverBaseUrl}/oauth/authorize?client_id=${clientId}&scope=${GitLabClientManager.SCOPES}&state=${providerState}&redirect_uri=${redirectUri}&response_type=code`

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

export default GitLabClientManager
