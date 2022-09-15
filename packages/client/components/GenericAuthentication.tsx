import styled from '@emotion/styled'
import React, {useRef} from 'react'
import useRouter from '../hooks/useRouter'
import {ForgotPasswordResType} from '../mutations/EmailPasswordResetMutation'
import {PALETTE} from '../styles/paletteV3'
import {
  CREATE_ACCOUNT_LABEL,
  CREATE_ACCOUNT_SLUG,
  SIGNIN_LABEL,
  SIGNIN_SLUG
} from '../utils/constants'
import AuthenticationDialog from './AuthenticationDialog'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordPage from './ForgotPasswordPage'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import PlainButton from './PlainButton/PlainButton'
import SubmittedForgotPasswordPage from './SubmittedForgotPasswordPage'

export type AuthPageSlug =
  | 'create-account'
  | 'signin'
  | 'forgot-password'
  | 'forgot-password/submitted'

export type GotoAuthPage = (page: AuthPageSlug, search?: string) => void

interface Props {
  goToPage: GotoAuthPage
  teamName?: string
  page: AuthPageSlug
  invitationToken?: string
}

const color = PALETTE.SKY_500

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
  color: PALETTE.SKY_500,
  ':hover,:focus': {
    color: PALETTE.SKY_500,
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

const GenericAuthentication = (props: Props) => {
  const {goToPage, invitationToken, page, teamName} = props
  const emailRef = useRef<{email: () => string}>()
  const {location} = useRouter()
  const params = new URLSearchParams(location.search)
  const email = params.get('email')

  const isGoogleAuthEnabled = window.__ACTION__.AUTH_GOOGLE_ENABLED
  const isInternalAuthEnabled = window.__ACTION__.AUTH_INTERNAL_ENABLED
  const isSSOAuthEnabled = window.__ACTION__.AUTH_SSO_ENABLED

  if (page === 'forgot-password') {
    return <ForgotPasswordPage goToPage={goToPage} />
  }

  if (page === 'forgot-password/submitted') {
    const type = params.get('type') as ForgotPasswordResType
    if (type && Object.values(ForgotPasswordResType).includes(type)) {
      return <SubmittedForgotPasswordPage goToPage={goToPage} />
    }
  }

  const isCreate = page === 'create-account'
  const action = isCreate ? CREATE_ACCOUNT_LABEL : SIGNIN_LABEL
  const counterAction = isCreate ? SIGNIN_LABEL : CREATE_ACCOUNT_LABEL
  const counterActionSlug = isCreate ? SIGNIN_SLUG : CREATE_ACCOUNT_SLUG
  const actionCopy = isCreate ? 'Already have an account? ' : 'New to Parabol? '
  const title = teamName ? `${teamName} is waiting` : action
  const onForgot = () => {
    goToPage('forgot-password', `?email=${emailRef.current?.email()}`)
  }
  return (
    <AuthenticationDialog>
      <DialogTitle>{title}</DialogTitle>
      <DialogSubTitle>
        <span>{actionCopy}</span>
        <BrandedLink onClick={() => goToPage(counterActionSlug, location.search)}>
          {counterAction}
        </BrandedLink>
      </DialogSubTitle>
      {isGoogleAuthEnabled && (
        <GoogleOAuthButtonBlock isCreate={isCreate} invitationToken={invitationToken} />
      )}
      {isGoogleAuthEnabled && (isInternalAuthEnabled || isSSOAuthEnabled) && (
        <HorizontalSeparator margin='1rem 0 0' text='or' />
      )}
      {(isInternalAuthEnabled || isSSOAuthEnabled) && (
        <EmailPasswordAuthForm
          email={email || ''}
          isSignin={!isCreate}
          invitationToken={invitationToken}
          ref={emailRef}
          goToPage={goToPage}
        />
      )}
      {isCreate ? (
        <AuthPrivacyFooter />
      ) : (
        isInternalAuthEnabled && (
          <ForgotPasswordLink onClick={onForgot}>{'Forgot your password?'}</ForgotPasswordLink>
        )
      )}
    </AuthenticationDialog>
  )
}

export default GenericAuthentication
