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
import {GotoAuthPage} from './GenericAuthentication'

const P = styled('p')({
  fontSize: 14,
  lineHeight: 1.5,
  margin: '16px 0',
  textAlign: 'center'
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

interface Props {
  gotoPage: GotoAuthPage
}

const getForgotPasswordRes = (search: string) => search.split('?type=').pop()

const SubmittedForgotPasswordPage = (props: Props) => {
  const {gotoPage} = props
  const {match, location} = useRouter<{token: string}>()
  const {search} = location
  const {params} = match
  const {token} = params
  const resType = getForgotPasswordRes(search) || ForgotPasswordTypes.SUCCESS

  const copyTypes = {
    goog: {
      title: 'Oops!',
      descriptionOne: 'It looks like you signed-up with Gmail.',
      descriptionTwo: 'Try logging in with Google here:',
      actionButton: <GoogleOAuthButtonBlock isCreate={false} invitationToken={token} />
    },
    success: {
      title: 'You’re all set!',
      descriptionOne: 'We’ve sent you an email with password recovery instructions.',
      descriptionTwo: (
        <>
          {'Didn’t get it? Check your spam folder, or '}
          <LinkButton>click here</LinkButton>
          {' to try again.'}
        </>
      ),
      actionButton: (
        <StyledPrimaryButton onClick={() => gotoPage('signin')} size='medium'>
          <IconLabel icon='arrow_back' label='Back to Sign In' />
        </StyledPrimaryButton>
      )
    }
  } as const
  const copy = copyTypes[resType]

  return (
    <AuthenticationDialog>
      <DialogTitle>{copy.title}</DialogTitle>
      <Container>
        <P>{copy.descriptionOne}</P>
        <P>{copy.descriptionTwo}</P>
        {copy.actionButton}
      </Container>
    </AuthenticationDialog>
  )
}

export default SubmittedForgotPasswordPage
