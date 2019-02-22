import {WebAuth} from 'auth0-js'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'
import AuthPage from 'universal/components/AuthPage/AuthPage'
import EmailPasswordAuthForm, {
  EmailPasswordAuthFormBase
} from 'universal/components/EmailPasswordAuthForm'
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
import makeWebAuth from '../utils/makeWebAuth'
import AuthDialog from './AuthDialog'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import * as Sentry from '@sentry/browser'

interface Props extends WithAtmosphereProps, RouteComponentProps, WithMutationProps {}

const color = PALETTE.LINK.BLUE

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

class AuthenticationPage extends Component<Props> {
  webAuth?: WebAuth

  componentDidMount () {
    makeWebAuth()
      .then((webAuth) => {
        this.webAuth = webAuth
      })
      .catch()
  }

  onOAuth = async () => {
    const {atmosphere, history, onCompleted, onError, submitMutation} = this.props
    if (!this.webAuth) return
    submitMutation()
    let res
    try {
      res = await auth0Authorize(this.webAuth)
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    const {idToken} = res
    const isCreate = location.pathname.includes(CREATE_ACCOUNT_SLUG)
    const segmentId = isCreate ? getAnonymousId() : undefined
    LoginMutation(atmosphere, {auth0Token: idToken, segmentId}, {history})
  }

  authFormRef = React.createRef<EmailPasswordAuthFormBase>()

  onForgot = () => {
    const {history} = this.props
    const email = this.authFormRef.current && this.authFormRef.current.props.fields.email.value
    history.push(`/reset-password?email=${email}`)
  }

  render () {
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
            label={isCreate ? 'Sign up using Google' : 'Sign in using Google'}
            onClick={this.onOAuth}
            isError={!!error}
            submitting={!!submitting}
          />
          <HorizontalSeparator margin='1rem 0 0' text='or' />
          <EmailPasswordAuthForm email='' isSignin={!isCreate} ref={this.authFormRef} />
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
