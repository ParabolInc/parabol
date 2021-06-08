import React from 'react'
import styled from '@emotion/styled'
import DialogTitle from './DialogTitle'
import AuthenticationDialog from './AuthenticationDialog'
import useRouter from '../hooks/useRouter'
import {ForgotPasswordTypes} from '../types/constEnums'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import IconLabel from './IconLabel'
import {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'

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
type CopyType = Record<ForgotPasswordTypes, TextField>

interface Props {
  gotoPage: GotoAuthPage
}

const SubmittedForgotPasswordPage = (props: Props) => {
  const {gotoPage} = props
  const {match, location} = useRouter<{token: string}>()
  const params = new URLSearchParams(location.search)
  const resType = params.get('type') || ForgotPasswordTypes.SUCCESS
  const email = params.get('email')
  const {token} = match.params

  const handleGoToPage = (page: AuthPageSlug, email: string | null) => {
    email ? gotoPage(page, `?email=${email}`) : gotoPage(page)
  }

  const copyTypes = {
    goog: {
      title: 'Oops!',
      descriptionOne: 'It looks like you signed-up with Gmail.',
      descriptionTwo: 'Try logging in with Google here:',
      button: (
        <ButtonWrapper>
          <GoogleOAuthButtonBlock isCreate={false} invitationToken={token} />
        </ButtonWrapper>
      )
    },
    success: {
      title: 'You’re all set!',
      descriptionOne: 'We’ve sent you an email with password recovery instructions.',
      descriptionTwo: (
        <>
          {'Didn’t get it? Check your spam folder, or '}
          <LinkButton onClick={() => handleGoToPage('forgot-password', email)}>
            click here
          </LinkButton>
          {' to try again.'}
        </>
      ),
      button: (
        <StyledPrimaryButton onClick={() => handleGoToPage('signin', email)} size='medium'>
          <IconLabel icon='arrow_back' label='Back to Sign In' />
        </StyledPrimaryButton>
      )
    }
  } as CopyType
  const copy = copyTypes[resType]

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
