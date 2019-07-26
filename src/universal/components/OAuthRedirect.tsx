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
    const search = window.location.hash.slice(1)
    const params = new URLSearchParams(search)
    const storedState = window.localStorage.getItem('auth0State')
    const invitationToken = window.localStorage.getItem('invitationToken')
    window.localStorage.removeItem('invitationToken')
    window.localStorage.removeItem('auth0State')
    const state = params.get('state')
    const code = params.get('id_token')
    const error = params.get('error')
    if (error) {
      console.error(error)
      return
    }
    // if handled in a popup window ie google
    if (window.opener) {
      window.opener.postMessage({state, code}, window.location.origin)
    } else {
      // if handled on same page ie email/pass
      if (!code || !storedState || storedState !== state) {
        window.location.href = window.location.origin
        return
      }
      const segmentId = getAnonymousId()
      LoginMutation(atmosphere, {auth0Token: code, invitationToken, segmentId}, {history})
    }
  }

  render () {
    return null
  }
}

export default withAtmosphere(withRouter(OAuthRedirect))
