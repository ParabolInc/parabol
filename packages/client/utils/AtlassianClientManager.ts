import makeHref from './makeHref'
import getOAuthPopupFeatures from './getOAuthPopupFeatures'
import AtlassianManager, {JiraPermissionScope} from './AtlassianManager'

class AtlassianClientManager extends AtlassianManager {
  fetch = window.fetch.bind(window)

  static openOAuth(
    onAuthCompleted: (code) => void,
    scopes: JiraPermissionScope[] = AtlassianManager.SCOPE
  ) {
    const providerState = Math.random()
      .toString(36)
      .substring(5)
    const redirect = makeHref('/auth/atlassian')
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
    const handler = (event) => {
      if (typeof event.data !== 'object' || event.origin !== window.location.origin) {
        return
      }
      const {code, state} = event.data
      if (state !== providerState || typeof code !== 'string') return
      onAuthCompleted(code)
      popup && popup.close()
      window.removeEventListener('message', handler)
    }
    window.addEventListener('message', handler)
  }
}

export default AtlassianClientManager
