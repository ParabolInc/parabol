import * as Sentry from '@sentry/browser'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'
import AuthPage from 'universal/components/AuthPage/AuthPage'
import EmailPasswordAuthForm from 'universal/components/EmailPasswordAuthForm'
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import autoLogin from 'universal/decorators/autoLogin'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import LoginMutation from 'universal/mutations/LoginMutation'
import {PALETTE} from 'universal/styles/paletteV2'
import {
  CREATE_ACCOUNT_LABEL,
  CREATE_ACCOUNT_SLUG,
  SIGNIN_LABEL,
  SIGNIN_SLUG
} from 'universal/utils/constants'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import auth0Authorize from '../utils/auth0Authorize'
import getAnonymousId from '../utils/getAnonymousId'
import AuthDialog from './AuthDialog'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'

interface Props extends WithAtmosphereProps, RouteComponentProps, WithMutationProps {}

const color = PALETTE.LINK_BLUE

const ForgotPasswordLink = styled(PlainButton)({
  color,
  fontSize: '.6875rem',
  lineHeight: '1.5rem',
  marginTop: '1rem',
  textAlign: 'center',
  ':hover,:focus,:active': {
    color
  }
})

interface State {
  existingAccount: null | 'google' | 'email'
}

const existingAccounts = {
  'user_exists_google-oauth2': 'google',
  user_exists_auth0: 'email'
}

class AuthenticationPage extends Component<Props, State> {
  state: State = {
    existingAccount: null
  }

  componentDidMount () {
    this.updateExistingAccountError()
  }

  componentDidUpdate () {
    this.updateExistingAccountError()
  }

  updateExistingAccountError () {
    if (!window.location.search) return
    const params = new URLSearchParams(window.location.search)
    const errorCode = params.get('error')
    const existingAccount = existingAccounts[errorCode!]
    if (existingAccount !== this.state.existingAccount) {
      this.setState({existingAccount})
    }
  }
  onOAuth = async () => {
    const {atmosphere, history, onCompleted, onError, submitMutation} = this.props
    submitMutation()
    let res
    try {
      res = await auth0Authorize()
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    if (!res) return
    const {idToken} = res
    const isCreate = location.pathname.includes(CREATE_ACCOUNT_SLUG)
    const segmentId = isCreate ? getAnonymousId() : undefined
    LoginMutation(atmosphere, {auth0Token: idToken, segmentId}, {history})
  }

  authFormRef = React.createRef<any>()

  onForgot = () => {
    const {history} = this.props
    const email = this.authFormRef.current && this.authFormRef.current.email.value
    history.push(`/reset-password?email=${email}`)
  }

  render () {
    const {existingAccount} = this.state
    const {submitting, error} = this.props
    const isCreate = location.pathname.includes(CREATE_ACCOUNT_SLUG)
    const title = isCreate ? CREATE_ACCOUNT_LABEL : SIGNIN_LABEL
    const altActionSlug = isCreate ? SIGNIN_SLUG : CREATE_ACCOUNT_SLUG
    return (
      <AuthPage title={`${title} | Parabol`}>
        <AuthDialog>
          <AuthHeader
            heading={title}
            actionCopy={isCreate ? 'Already have an account?' : 'New to Parabol?'}
            relativeUrl={`/${altActionSlug}${location.search}`}
            displayName={isCreate ? SIGNIN_LABEL : CREATE_ACCOUNT_LABEL}
          />
          <GoogleOAuthButtonBlock
            label={isCreate ? 'Sign up with Google' : 'Sign in with Google'}
            onClick={this.onOAuth}
            isError={!!error}
            submitting={!!submitting}
            existingAccount={existingAccount === 'google'}
          />
          <HorizontalSeparator margin='1rem 0 0' text='or' />
          <EmailPasswordAuthForm
            email=''
            isSignin={!isCreate}
            fieldsRef={this.authFormRef}
            existingAccount={existingAccount === 'email'}
          />
          {isCreate ? (
            <AuthPrivacyFooter />
          ) : (
            <ForgotPasswordLink onClick={this.onForgot}>
              {'Forgot your password?'}
            </ForgotPasswordLink>
          )}
        </AuthDialog>
      </AuthPage>
    )
  }
}

export default autoLogin(withAtmosphere(withRouter(withMutationProps(AuthenticationPage))))
