import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
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

  const {t} = useTranslation()

  const {match, location} = useRouter<{token: string}>()
  const params = new URLSearchParams(location.search)
  const forgotPasswordResType = params.get('type') || ForgotPasswordResType.SUCCESS
  const email = params.get('email')
  const {token} = match.params
  const contactSupportCopy = (
    <>
      <a
        href={t('SubmittedForgotPasswordPage.MailtoLoveParabolCo')}
        rel='noopener noreferrer'
        target='_blank'
        style={emailLinkStyle}
        title={t('SubmittedForgotPasswordPage.LoveParabolCo')}
      >
        {t('SubmittedForgotPasswordPage.ClickHere')}
      </a>
      {t('SubmittedForgotPasswordPage.ToContactSupport')}
    </>
  )

  const goToPageWithEmail = (page: AuthPageSlug, email: string | null) => {
    email
      ? goToPage(
          page,
          t('SubmittedForgotPasswordPage.EmailEmail', {
            email
          })
        )
      : goToPage(page)
  }

  const copyTypes = {
    goog: {
      title: 'Oops!',
      descriptionOne: t('SubmittedForgotPasswordPage.ItLooksLikeYouMayHaveSignedUpWithGmail'),
      descriptionTwo: (
        <>
          {t('SubmittedForgotPasswordPage.TrySigningInWithGoogleOr', {})}
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
      descriptionOne: t('SubmittedForgotPasswordPage.ItLooksLikeYouMayHaveSignedUpUsingSso'),
      descriptionTwo: (
        <>
          {t('SubmittedForgotPasswordPage.TrySigningInWithSsoOr', {})}
          {contactSupportCopy}
        </>
      ),
      button: (
        <StyledPrimaryButton onClick={() => goToPage('signin', '?sso=true')} size='medium'>
          {t('SubmittedForgotPasswordPage.SignInWithSso')}
        </StyledPrimaryButton>
      )
    },
    success: {
      title: t('SubmittedForgotPasswordPage.YoureAllSet'),
      descriptionOne: t(
        'SubmittedForgotPasswordPage.WeveSentYouAnEmailWithPasswordRecoveryInstructions'
      ),
      descriptionTwo: (
        <>
          {t('SubmittedForgotPasswordPage.DidntGetItCheckYourSpamFolderOr')}
          <LinkButton onClick={() => goToPageWithEmail('forgot-password', email)}>
            {t('SubmittedForgotPasswordPage.ClickHere')}
          </LinkButton>
          {t('SubmittedForgotPasswordPage.ToTryAgain')}
        </>
      ),
      button: (
        <StyledPrimaryButton onClick={() => goToPageWithEmail('signin', email)} size='medium'>
          <IconLabel icon='arrow_back' label={t('SubmittedForgotPasswordPage.BackToSignIn')} />
        </StyledPrimaryButton>
      )
    }
  } as CopyType
  const copy = copyTypes[forgotPasswordResType]

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
