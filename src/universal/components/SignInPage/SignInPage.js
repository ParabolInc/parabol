/**
 * The sign-in page.  Hosts 3rd party signin, email/password signin, and also
 * functions as the callback handler for the Auth0 OIDC response.
 *
 * @flow
 */

import type {Node} from 'react'
import type {RouterHistory, Location} from 'react-router-dom'
import type {Dispatch} from 'redux'
import type {AuthResponse, Credentials} from 'universal/types/auth'
import React, {Component, Fragment} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import auth0Login from 'universal/utils/auth0Login'
import {THIRD_PARTY_AUTH_PROVIDERS, SIGNIN_LABEL, SIGNIN_SLUG} from 'universal/utils/constants'
import getWebAuth from 'universal/utils/getWebAuth'
import promisify from 'es6-promisify'
import SignIn from './SignIn'
import autoLogin from 'universal/decorators/autoLogin'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import AuthPage from 'universal/components/AuthPage/AuthPage'

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  history: RouterHistory,
  location: Location,
  webAuth: Object
}

type State = {
  loggingIn: boolean,
  error: ?string,
  submittingCredentials: boolean
}

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false,
    submittingCredentials: false
  }

  componentDidMount () {
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

  render () {
    const {loggingIn, error} = this.state
    let pageContent: Node
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

export default withAtmosphere(autoLogin(withRouter(connect()(SignInPage))))
