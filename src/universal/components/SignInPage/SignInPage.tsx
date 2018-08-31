/**
 * The sign-in page.  Hosts 3rd party signin, email/password signin, and also
 * functions as the callback handler for the Auth0 OIDC response.
 *
 */

import React, {Component, Fragment, ReactElement} from 'react'
import {connect} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Dispatch} from 'redux'
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import auth0Login from 'universal/utils/auth0Login'
import {THIRD_PARTY_AUTH_PROVIDERS, SIGNIN_LABEL, SIGNIN_SLUG} from 'universal/utils/constants'
import getWebAuth from 'universal/utils/getWebAuth'
import promisify from 'es6-promisify'
import SignIn from './SignIn'
import autoLogin from 'universal/decorators/autoLogin'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import AuthPage from 'universal/components/AuthPage/AuthPage'

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  dispatch: Dispatch<any>
  webAuth: any
}

interface State {
  loggingIn: boolean
  error: string | null
  submittingCredentials: boolean
}

interface AuthResponse {
  idToken: string
  idTokenPayload: any
}

interface Credentials {
  email: string
  password: string
}

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false,
    submittingCredentials: false
  }

  componentDidMount() {
    this.maybeCaptureAuthResponse()
  }

  getHandlerForThirdPartyAuth = (auth0Connection: string) => () => {
    this.webAuth.authorize({
      connection: auth0Connection,
      responseType: 'token'
    })
  }

  maybeCaptureAuthResponse = async () => {
    // If we've received an auth response, log us in
    const {hash} = this.props.location
    if (hash) {
      this.setState({loggingIn: true})
      try {
        const authResponse = await this.parseAuthResponse(hash)
        this.appSignIn(authResponse)
      } catch (error) {
        this.setState({error: error.error_description})
      }
    }
  }

  parseAuthResponse = (hash: string): Promise<AuthResponse> => {
    const parseHash = promisify(this.webAuth.parseHash, this.webAuth)
    return parseHash({hash})
  }

  resetState = () => {
    this.setState({loggingIn: false, error: null})
  }

  appSignIn = (response: AuthResponse): void => {
    const {atmosphere, dispatch, history, location} = this.props
    signinAndUpdateToken(atmosphere, dispatch, history, location, response.idToken)
  }

  webAuth = getWebAuth()

  handleSubmitCredentials = async (credentials: Credentials) => {
    this.setState({submittingCredentials: true, error: null})
    try {
      await auth0Login(this.webAuth, credentials)
    } catch (error) {
      this.setState({error: error.error_description})
    }
    this.setState({submittingCredentials: false})
  }

  renderLoading = () => {
    return <LoadingView />
  }

  renderLoadingError = () => {
    return (
      <Fragment>
        <h1>🤭 Oops!</h1>
        <p>We had some trouble signing you in!</p>
        <p>
          Try going back to the{' '}
          <Link to={`/${SIGNIN_SLUG}`} onClick={this.resetState}>
            Sign in page
          </Link>{' '}
          in order to sign in again.
        </p>
      </Fragment>
    )
  }

  renderSignIn = () => {
    const {error, submittingCredentials} = this.state
    return (
      <SignIn
        authProviders={THIRD_PARTY_AUTH_PROVIDERS}
        getHandlerForThirdPartyAuth={this.getHandlerForThirdPartyAuth}
        handleSubmitCredentials={this.handleSubmitCredentials}
        error={error}
        isSubmitting={submittingCredentials}
      />
    )
  }

  render() {
    const {loggingIn, error} = this.state
    let pageContent: ReactElement<any>
    if (loggingIn && !error) {
      pageContent = this.renderLoading()
    } else if (loggingIn && error) {
      pageContent = this.renderLoadingError()
    } else {
      pageContent = this.renderSignIn()
    }
    return <AuthPage title={`${SIGNIN_LABEL} | Parabol`}>{pageContent}</AuthPage>
  }
}

export default (connect() as any)((autoLogin as any)(withAtmosphere(withRouter(SignInPage))))
