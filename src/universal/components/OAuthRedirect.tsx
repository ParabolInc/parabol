import {Component} from 'react'
import promisify from 'es6-promisify'
import {RouteComponentProps, withRouter} from 'react-router'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken'

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

class OAuthRedirect extends Component<Props> {
  componentDidMount () {
    this.callOpener().catch()
  }

  callOpener = async () => {
    const {atmosphere, history, location} = this.props
    const auth0 = await import('auth0-js/build/auth0')
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
      signinAndUpdateToken(atmosphere, history, location, idToken)
    }
  }

  render () {
    return null
  }
}

export default withAtmosphere(withRouter(OAuthRedirect))
