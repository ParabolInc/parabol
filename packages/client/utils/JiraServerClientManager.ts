import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import CreateOAuth1AuthorizeUrlMutation from '../mutations/CreateOAuth1AuthorizeUrlMutation'
class JiraServerClientManager {
  static SCOPES = 'read_api'
  static openOAuth(
    atmosphere: Atmosphere,
    providerId: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps

    // Open synchronously because of Safari
    const popup = window.open(
      '',
      'OAuth',
      getOAuthPopupFeatures({width: 500, height: 750, top: 56})
    )

    const onUrlCompleted = (result: any) => {
      const uri = result.createOAuth1AuthorizeUrl.url
      window.open(
        uri,
        'OAuth',
        getOAuthPopupFeatures({width: 500, height: 750, top: 56})
      )
    }

    CreateOAuth1AuthorizeUrlMutation(atmosphere, {providerId, teamId}, {onCompleted: onUrlCompleted})

    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin || submitting) {
        return
      }
      const {oauthToken, oauthVerifier} = event.data
      submitMutation()
      AddTeamMemberIntegrationAuthMutation(
        atmosphere,
        {providerId, oauthCodeOrPat: oauthToken, oauthVerifier, teamId},
        {onError, onCompleted}
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default JiraServerClientManager
