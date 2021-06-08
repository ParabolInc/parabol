/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import React from 'react'
import styled from '@emotion/styled'
import EmailInputField from './EmailInputField'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import {emailRegex} from '../validation/regex'
import Legitity from '../validation/Legitity'
import AuthenticationDialog from './AuthenticationDialog'
import {GotoAuthPage} from './GenericAuthentication'
import DialogTitle from './DialogTitle'
import {PALETTE} from '../styles/paletteV3'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'

interface Props {
  email?: string
  gotoPage: GotoAuthPage
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

const validateEmail = (email) => {
  return new Legitity(email)
    .trim()
    .required('Please enter an email address')
    .matches(emailRegex, 'Please enter a valid email address')
}

const ForgotPasswordPage = (props: Props) => {
  const {gotoPage} = props
  const {submitMutation, submitting, onCompleted, onError} = useMutationProps()
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
    setDirtyField(name)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes} = validateField()
    if (emailRes.error) return
    const email = emailRes.value as string
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
    gotoPage('signin', params.toString())
  }

  return (
    <AuthenticationDialog>
      <DialogTitle>{'Forgot your password?'}</DialogTitle>
      <DialogSubTitle>
        <span>{'Remember it? '}</span>
        <BrandedLink onClick={gotoSignIn}>{'Sign in with password'}</BrandedLink>
      </DialogSubTitle>
      <Container>
        <P>
          {
            'Confirm your email address, and we’ll send you an email with password recovery instructions.'
          }
        </P>
        <Form onSubmit={onSubmit}>
          <EmailInputField {...fields.email} autoFocus onChange={onChange} onBlur={handleBlur} />
          <SubmitButton size='medium' waiting={submitting}>
            {'Send Email'}
          </SubmitButton>
        </Form>
      </Container>
    </AuthenticationDialog>
  )
}

export default ForgotPasswordPage
