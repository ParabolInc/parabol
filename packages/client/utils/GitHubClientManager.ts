import Atmosphere from '../Atmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import AddGitHubAuthMutation from '../mutations/AddGitHubAuthMutation'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import GitHubManager from './GitHubManager'

class GitHubClientManager extends GitHubManager {
  static openOAuth(atmosphere: Atmosphere, teamId: string, mutationProps: MenuMutationProps) {
    const {submitting, onError, onCompleted, submitMutation} = mutationProps
    const providerState = Math.random()
      .toString(36)
      .substring(5)
    const uri = `https://github.com/login/oauth/authorize?client_id=${window.__ACTION__.github}&scope=${GitHubClientManager.SCOPE}&state=${providerState}`

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
      AddGitHubAuthMutation(atmosphere, {code, teamId}, {onError, onCompleted})
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default GitHubClientManager
