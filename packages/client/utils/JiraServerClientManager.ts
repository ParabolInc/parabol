import {CreateOAuth1AuthorizeUrlMutation as TCreateOAuth1AuthorizeUrlMutation} from '~/__generated__/CreateOAuth1AuthorizeUrlMutation.graphql'
import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import CreateOAuth1AuthorizeUrlMutation from '../mutations/CreateOAuth1AuthorizeUrlMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
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

    const onUrlCompleted = (result: TCreateOAuth1AuthorizeUrlMutation['response']) => {
      if (popup) {
        if (!result.createOAuth1AuthorizeUrl?.url) {
          onError(result.createOAuth1AuthorizeUrl?.error)
          popup.close()
          return
        }
        popup.location.href = result.createOAuth1AuthorizeUrl.url
      }
    }

    CreateOAuth1AuthorizeUrlMutation(
      atmosphere,
      {providerId, teamId},
      {onCompleted: onUrlCompleted}
    )

    const handler = (event: MessageEvent) => {
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
