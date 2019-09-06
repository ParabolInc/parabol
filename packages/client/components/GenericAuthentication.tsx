import * as Sentry from '@sentry/browser'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {RouteComponentProps, withRouter} from 'react-router'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import PlainButton from './PlainButton/PlainButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import LoginMutation from '../mutations/LoginMutation'
import {PALETTE} from '../styles/paletteV2'
import {
  CREATE_ACCOUNT_LABEL,
  CREATE_ACCOUNT_SLUG,
  SIGNIN_LABEL,
  SIGNIN_SLUG
} from '../utils/constants'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import getAnonymousId from '../utils/getAnonymousId'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import DialogTitle from './DialogTitle'
import ResetPasswordPage from './ResetPasswordPage/ResetPasswordPage'
import AuthenticationDialog from './AuthenticationDialog'
import Auth0ClientManager from '../utils/Auth0ClientManager'

export type AuthPageSlug = 'create-account' | 'signin' | 'reset-password'

export type GotoAuathPage = (page: AuthPageSlug, search?: string) => void

interface Props extends WithAtmosphereProps, RouteComponentProps, WithMutationProps {
  gotoPage: GotoAuathPage
  teamName?: string
  page: AuthPageSlug
  invitationToken?: string
}

const color = PALETTE.LINK_BLUE

const ForgotPasswordLink = styled(PlainButton)({
  color,
  fontSize: 11,
  lineHeight: '24px',
  marginTop: 8,
  textAlign: 'center',
  ':hover,:focus,:active': {
    color
  }
})

const BrandedLink = styled(PlainButton)({
  color: PALETTE.LINK_BLUE,
  ':hover,:focus': {
    color: PALETTE.LINK_BLUE,
    textDecoration: 'underline'
  }
})

const DialogSubTitle = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  paddingTop: 16,
  paddingBottom: 24
})

interface State {
  existingAccount: null | 'google' | 'email'
  isForgot: boolean
}

const existingAccounts = {
  'user_exists_google-oauth2': 'google',
  user_exists_auth0: 'email'
}

class GenericAuthentication extends Component<Props, State> {
  state: State = {
    existingAccount: null,
    isForgot: false,
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
    const {
      atmosphere,
      history,
      page,
      onCompleted,
      onError,
      submitMutation,
      invitationToken
    } = this.props
    submitMutation()
    const manager = new Auth0ClientManager()
    let res
    try {
      res = await manager.loginWithGoogle()
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    if (!res) return
    const {idToken} = res
    const segmentId = page === 'create-account' ? getAnonymousId() : undefined
    LoginMutation(atmosphere, {auth0Token: idToken, segmentId, invitationToken}, {history})
  }

  authFormRef = React.createRef<any>()

  onForgot = () => {
    const {gotoPage} = this.props
    const email = this.authFormRef.current && this.authFormRef.current.email.value
    gotoPage('reset-password', `?email=${email}`)
  }

  render () {
    const {existingAccount} = this.state
    const {submitting, error, page, teamName, gotoPage} = this.props
    if (page === 'reset-password') {
      return (
        <ResetPasswordPage
          email={this.authFormRef.current && this.authFormRef.current.email.value}
          gotoPage={gotoPage}
        />
      )
    }
    const isCreate = page === 'create-account'
    const action = isCreate ? CREATE_ACCOUNT_LABEL : SIGNIN_LABEL
    const counterAction = isCreate ? SIGNIN_LABEL : CREATE_ACCOUNT_LABEL
    const counterActionSlug = isCreate ? SIGNIN_SLUG : CREATE_ACCOUNT_SLUG
    const actionCopy = isCreate ? 'Already have an account? ' : 'New to Parabol? '
    const oauthCopy = isCreate ? 'Sign up with Google' : 'Sign in with Google'
    const title = teamName ? `${teamName} is waiting` : action
    return (
      <AuthenticationDialog>
        <DialogTitle>{title}</DialogTitle>
        <DialogSubTitle>
          <span>{actionCopy}</span>
          <BrandedLink onClick={() => gotoPage(counterActionSlug, location.search)}>
            {counterAction}
          </BrandedLink>
        </DialogSubTitle>
        <GoogleOAuthButtonBlock
          label={oauthCopy}
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
          <>
          <ForgotPasswordLink onClick={this.onForgot}>{'Forgot your password?'}</ForgotPasswordLink>
          </>
        )}
      </AuthenticationDialog>
    )
  }
}

export default withAtmosphere(withRouter(withMutationProps(GenericAuthentication)))
