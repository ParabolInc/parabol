import promisify from 'es6-promisify'
import {Component} from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import LoginMutation from 'universal/mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import getAnonymousId from '../utils/getAnonymousId'

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

class OAuthRedirect extends Component<Props> {
  componentDidMount () {
    this.callOpener().catch()
  }

  callOpener = async () => {
    const {atmosphere, history} = this.props
    const auth0 = await import(/* webpackChunkName: 'Auth0' */ 'auth0-js/build/auth0')
    const webAuth = new auth0.WebAuth({
      domain: window.__ACTION__.auth0Domain,
      clientID: window.__ACTION__.auth0,
      scope: 'openid rol tms bet'
    })
    if (window.opener) {
      // if handled in a popup window ie google
      webAuth.popup.callback()
    } else {
      // if handled on same page ie email/pass
      const parseHash = promisify(webAuth.parseHash, webAuth)
      const res = await parseHash()
      const {idToken} = res
      const invitationToken = window.localStorage.getItem('invitationToken')
      window.localStorage.removeItem('invitationToken')
      const segmentId = getAnonymousId()
      LoginMutation(atmosphere, {auth0Token: idToken, invitationToken, segmentId}, {history})
    }
  }

  render () {
    return null
  }
}

export default withAtmosphere(withRouter(OAuthRedirect))
