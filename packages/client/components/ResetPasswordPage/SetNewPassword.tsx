import styled from '@emotion/styled'
import type * as React from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import useCanonical from '~/hooks/useCanonical'
import useAtmosphere from '../../hooks/useAtmosphere'
import useForm from '../../hooks/useForm'
import useMutationProps from '../../hooks/useMutationProps'
import ResetPasswordMutation from '../../mutations/ResetPasswordMutation'
import {passwordStrength} from '../../shared/passwordStrength'
import {Security} from '../../types/constEnums'
import Legitity from '../../validation/Legitity'
import AuthenticationDialog from '../AuthenticationDialog'
import DialogTitle from '../DialogTitle'
import ErrorAlert from '../ErrorAlert/ErrorAlert'
import PasswordInputField from '../PasswordInputField'
import PrimaryButton from '../PrimaryButton'
import TeamInvitationWrapper from '../TeamInvitationWrapper'

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

const validatePassword = (password: string) => {
  return new Legitity(password)
    .required('Please enter a password')
    .min(Security.MIN_PASSWORD_LENGTH, `${Security.MIN_PASSWORD_LENGTH} character minimum`)
    .max(1000, `That's a book, not a password`)
    .test((value) => passwordStrength(value))
}

const SetNewPassword = () => {
  const navigate = useNavigate()
  const {token} = useParams()
  const atmosphere = useAtmosphere()
  useCanonical('reset-password')
  const {onCompleted, onError, error, submitting, submitMutation} = useMutationProps()
  const {fields, onChange, setDirtyField, validateField} = useForm({
    password: {
      getDefault: () => '',
      validate: validatePassword
    }
  })
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const {name} = e.target
    if (name === 'password') {
      setDirtyField(name)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {password: passwordRes} = validateField()
    if (passwordRes.error) return
    const {value: newPassword} = passwordRes
    submitMutation()
    ResetPasswordMutation(
      atmosphere,
      {newPassword, token: token!},
      {onError, onCompleted, navigate}
    )
  }
  return (
    <TeamInvitationWrapper>
      <AuthenticationDialog>
        <DialogTitle>{'Reset Password'}</DialogTitle>
        <Container>
          <P>{'Type your new password below'}</P>
          {error && <ErrorAlert message={error.message} />}
          <Form onSubmit={onSubmit}>
            <PasswordInputField
              {...fields.password}
              autoFocus
              onChange={onChange}
              onBlur={handleBlur}
            />
            <SubmitButton size='medium' waiting={submitting}>
              {'Reset Password'}
            </SubmitButton>
          </Form>
        </Container>
      </AuthenticationDialog>
    </TeamInvitationWrapper>
  )
}

export default SetNewPassword
