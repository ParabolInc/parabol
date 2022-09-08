/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import {PALETTE} from '../styles/paletteV3'
import {AuthenticationError} from '../types/constEnums'
import Legitity from '../validation/Legitity'
import {emailRegex} from '../validation/regex'
import AuthenticationDialog from './AuthenticationDialog'
import DialogTitle from './DialogTitle'
import EmailInputField from './EmailInputField'
import {GotoAuthPage} from './GenericAuthentication'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import StyledError from './StyledError'

interface Props {
  email?: string
  goToPage: GotoAuthPage
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

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

const SubmitButton = styled(PrimaryButton)({
  marginTop: 16
})

const ErrorMessage = styled(StyledError)({
  fontSize: 12,
  paddingTop: 16
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
  padding: '16px 0px 0px'
})

const linkStyle = {
  color: PALETTE.TOMATO_500,
  fontSize: 12,
  textDecoration: 'underline'
}

const validateEmail = (email) => {
  return new Legitity(email)
    .trim()
    .required('Please enter an email address')
    .matches(emailRegex, 'Please enter a valid email address')
}

const ForgotPasswordPage = (props: Props) => {
  const {goToPage} = props

  const {t} = useTranslation()

  const {submitMutation, submitting, onCompleted, onError, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {validateField, setDirtyField, onChange, fields} = useForm({
    email: {
      getDefault: () => {
        const params = new URLSearchParams(window.location.search)
        const email = params.get('email')
        return props.email || email || ''
      },
      validate: validateEmail
    }
  })
  const {history} = useRouter()

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const {name} = e.target
    if (name === 'email') {
      setDirtyField(name)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes} = validateField()
    if (emailRes.error) return
    const {value: email} = emailRes
    submitMutation()

    EmailPasswordResetMutation(
      atmosphere,
      {email},
      {
        history,
        onCompleted,
        onError
      }
    )
    onCompleted()
  }

  const gotoSignIn = () => {
    const params = new URLSearchParams(location.search)
    params.delete('email')
    goToPage('signin', params.toString())
  }

  const errorMessage = {
    [AuthenticationError.USER_NOT_FOUND]: t(
      'ForgotPasswordPage.WeCouldntFindThatEmailPleaseTryAgain'
    ),
    [AuthenticationError.EXCEEDED_RESET_THRESHOLD]: t(
      'ForgotPasswordPage.TooManyResetPasswordAttemptsPleaseTryAgainLater'
    )
  }
  const prettyError = error ? errorMessage[error.message] : undefined
  return (
    <AuthenticationDialog>
      <DialogTitle>{t('ForgotPasswordPage.ForgotYourPassword')}</DialogTitle>
      <DialogSubTitle>
        <span>{t('ForgotPasswordPage.RememberIt')}</span>
        <BrandedLink onClick={gotoSignIn}>{t('ForgotPasswordPage.SignInWithPassword')}</BrandedLink>
      </DialogSubTitle>
      <Container>
        <P>
          {t(
            'ForgotPasswordPage.ConfirmYourEmailAddressAndWellSendYouAnEmailWithPasswordRecoveryInstructions'
          )}
        </P>
        <Form onSubmit={onSubmit}>
          <EmailInputField {...fields.email} autoFocus onChange={onChange} onBlur={handleBlur} />
          <SubmitButton size='medium' waiting={submitting}>
            {t('ForgotPasswordPage.SendEmail')}
          </SubmitButton>
          {error && (
            <ErrorMessage>
              {prettyError || (
                <>
                  {t('ForgotPasswordPage.OhNoSomethingWentWrongTryAgainOr')}{' '}
                  <a
                    href={t('ForgotPasswordPage.MailtoLoveParabolCo')}
                    rel='noopener noreferrer'
                    target='_blank'
                    style={linkStyle}
                    title={t('ForgotPasswordPage.LoveParabolCo')}
                  >
                    {t('ForgotPasswordPage.ContactUs')}.
                  </a>
                </>
              )}
            </ErrorMessage>
          )}
        </Form>
      </Container>
    </AuthenticationDialog>
  )
}

export default ForgotPasswordPage
