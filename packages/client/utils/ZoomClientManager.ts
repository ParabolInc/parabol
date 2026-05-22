import type Atmosphere from '../Atmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import AddTeamMemberIntegrationAuthMutation from '../mutations/AddTeamMemberIntegrationAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import makeHref from './makeHref'

class ZoomClientManager {
  static SCOPES = 'meeting:read:summary cloud_recording:read:recording user:read:user'

  static openOAuth(
    atmosphere: Atmosphere,
    providerId: string,
    clientId: string,
    teamId: string,
    mutationProps: MenuMutationProps
  ) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random().toString(36).substring(5)
    const redirectUri = makeHref('/auth/zoom')
    const uri = `https://zoom.us/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${providerState}&scope=${encodeURIComponent(ZoomClientManager.SCOPES)}`

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
        {
          onError,
          onCompleted: (res, errors) => {
            if (errors || (res as any)?.addTeamMemberIntegrationAuth?.error) {
              onError(errors?.[0] ?? new Error('Failed to connect Zoom'))
              return
            }
            onCompleted(res, errors)
          }
        }
      )
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default ZoomClientManager
