import styled from '@emotion/styled'
import React from 'react'
import useRouter from '../hooks/useRouter'
import {emailLinkStyle} from '../modules/email/styles'
import {ForgotPasswordResType} from '../mutations/EmailPasswordResetMutation'
import {PALETTE} from '../styles/paletteV3'
import AuthenticationDialog from './AuthenticationDialog'
import DialogTitle from './DialogTitle'
import {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import IconLabel from './IconLabel'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'

const P = styled('p')({
  fontSize: 14,
  lineHeight: 1.5,
  margin: '16px 0',
  textAlign: 'center'
})

const ButtonWrapper = styled('div')({
  paddingTop: 8
})

const Container = styled('div')({
  margin: '0 auto',
  maxWidth: 240,
  width: '100%'
})

const LinkButton = styled(PlainButton)({
  color: PALETTE.SKY_500,
  ':hover': {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
})

const StyledPrimaryButton = styled(PrimaryButton)({
  margin: '16px auto 0',
  width: 240
})

type TextField = {
  title: string
  descriptionOne: string | JSX.Element
  descriptionTwo: string | JSX.Element
  button: JSX.Element
}
type CopyType = Record<ForgotPasswordResType, TextField>

interface Props {
  goToPage: GotoAuthPage
}

const SubmittedForgotPasswordPage = (props: Props) => {
  const {goToPage} = props
  const {match, location} = useRouter<{token: string}>()
  const params = new URLSearchParams(location.search)
  const forgotPasswordResType = params.get('type') || ForgotPasswordResType.SUCCESS
  const email = params.get('email')
  const {token} = match.params
  const contactSupportCopy = (
    <>
      <a
        href={'mailto:love@parabol.co'}
        rel='noopener noreferrer'
        target='_blank'
        style={emailLinkStyle}
        title={'love@parabol.co'}
      >
        {'click here '}
      </a>
      {'to contact support.'}
    </>
  )

  const goToPageWithEmail = (page: AuthPageSlug, email: string | null) => {
    email ? goToPage(page, `?email=${email}`) : goToPage(page)
  }

  const copyTypes = {
    goog: {
      title: 'Oops!',
      descriptionOne: 'It looks like you may have signed-up with Gmail.',
      descriptionTwo: (
        <>
          {`Try signing in with Google or `}
          {contactSupportCopy}
        </>
      ),
      button: (
        <ButtonWrapper>
          <GoogleOAuthButtonBlock isCreate={false} invitationToken={token} />
        </ButtonWrapper>
      )
    },
    saml: {
      title: 'Oops!',
      descriptionOne: 'It looks like you may have signed-up using SSO.',
      descriptionTwo: (
        <>
          {`Try signing in with SSO or `}
          {contactSupportCopy}
        </>
      ),
      button: (
        <StyledPrimaryButton onClick={() => goToPage('signin', '?sso=true')} size='medium'>
          {'Sign In with SSO'}
        </StyledPrimaryButton>
      )
    },
    success: {
      title: 'You’re all set!',
      descriptionOne: 'We’ve sent you an email with password recovery instructions.',
      descriptionTwo: (
        <>
          {'Didn’t get it? Check your spam folder, or '}
          <LinkButton onClick={() => goToPageWithEmail('forgot-password', email)}>
            click here
          </LinkButton>
          {' to try again.'}
        </>
      ),
      button: (
        <StyledPrimaryButton onClick={() => goToPageWithEmail('signin', email)} size='medium'>
          <IconLabel icon='arrow_back' label='Back to Sign In' />
        </StyledPrimaryButton>
      )
    }
  } as CopyType
  const copy = copyTypes[forgotPasswordResType as keyof typeof copyTypes]

  return (
    <AuthenticationDialog>
      <DialogTitle>{copy.title}</DialogTitle>
      <Container>
        <P>{copy.descriptionOne}</P>
        <P>{copy.descriptionTwo}</P>
        {copy.button}
      </Container>
    </AuthenticationDialog>
  )
}

export default SubmittedForgotPasswordPage
