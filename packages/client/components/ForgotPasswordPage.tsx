/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import type * as React from 'react'
import {useNavigate} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import {AuthenticationError} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import Legitity from '../validation/Legitity'
import {emailRegex} from '../validation/regex'
import AuthenticationDialog from './AuthenticationDialog'
import DialogTitle from './DialogTitle'
import EmailInputField from './EmailInputField'
import type {GotoAuthPage} from './GenericAuthentication'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

interface Props {
  email?: string
  goToPage: GotoAuthPage
}

const validateEmail = (email: string) => {
  return new Legitity(email)
    .trim()
    .required('Please enter an email address')
    .matches(emailRegex, 'Please enter a valid email address')
}

const ForgotPasswordPage = (props: Props) => {
  const {goToPage} = props
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
  const navigate = useNavigate()

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const {name} = e.target
    if (name === 'email') {
      setDirtyField(name)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
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
        navigate,
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
    [AuthenticationError.USER_NOT_FOUND]: 'We couldn’t find that email. Please try again.',
    [AuthenticationError.EXCEEDED_RESET_THRESHOLD]:
      'Too many reset password attempts. Please try again later.'
  }
  const prettyError = error ? errorMessage[error.message as keyof typeof errorMessage] : undefined
  return (
    <AuthenticationDialog>
      <DialogTitle>{'Forgot your password?'}</DialogTitle>
      <div className='pt-4 font-normal text-sm leading-normal'>
        <span>{'Remember it? '}</span>
        <PlainButton className='text-accent hover:underline focus:underline' onClick={gotoSignIn}>
          {'Sign in with password'}
        </PlainButton>
      </div>
      <div className='mx-auto w-full max-w-[240px]'>
        <p className='my-4 text-center text-sm leading-normal'>
          {
            'Confirm your email address, and we’ll send you an email with password recovery instructions.'
          }
        </p>
        <form className='flex flex-col' onSubmit={onSubmit}>
          <EmailInputField {...fields.email} autoFocus onChange={onChange} onBlur={handleBlur} />
          <Button
            variant='primary'
            className='mt-4 h-10 text-[15px]'
            size='md'
            disabled={submitting}
          >
            {'Send Email'}
          </Button>
          {error && (
            <StyledError className='pt-4 text-[12px]'>
              {prettyError || (
                <>
                  {'Oh no! Something went wrong. Try again or '}{' '}
                  <a
                    className='text-[12px] text-fg-error underline'
                    href={'mailto:love@parabol.co'}
                    rel='noopener noreferrer'
                    target='_blank'
                    title={'love@parabol.co'}
                  >
                    {'contact us'}.
                  </a>
                </>
              )}
            </StyledError>
          )}
        </form>
      </div>
    </AuthenticationDialog>
  )
}

export default ForgotPasswordPage
