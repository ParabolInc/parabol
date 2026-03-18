import styled from '@emotion/styled'
import type * as React from 'react'
import {useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import ReAuthWithPasswordMutation from '../mutations/ReAuthWithPasswordMutation'
import logo from '../styles/theme/images/graphics/google.svg'
import microsoftLogo from '../styles/theme/images/graphics/microsoft.svg'
import {cn} from '../ui/cn'
import GoogleClientManager from '../utils/GoogleClientManager'
import getSAMLIdP from '../utils/getSAMLIdP'
import loginSSO from '../utils/loginSSO'
import MicrosoftClientManager from '../utils/MicrosoftClientManager'
import UnderlineInput from './InputField/UnderlineInput'
import PrimaryButton from './PrimaryButton'
import RaisedButton from './RaisedButton'
import StyledError from './StyledError'
import TinyLabel from './TinyLabel'

const Fields = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16
})

const FieldGroup = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4
})

const Label = styled(TinyLabel)({
  fontSize: 12,
  fontWeight: 600
})

const ErrorMsg = styled(StyledError)({
  fontSize: '.8125rem',
  marginTop: '.5rem'
})

const ButtonGroup = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start'
})

const Divider = styled('div')({
  fontSize: 12,
  color: '#94a3b8',
  textAlign: 'center',
  margin: '4px 0'
})

interface Identity {
  type: string
}

interface Props {
  email: string
  identities: readonly Identity[]
  onReAuthSuccess: () => void
}

const DeleteAccountReAuthStep = ({email, identities, onReAuthSuccess}: Props) => {
  const atmosphere = useAtmosphere()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [ssoError, setSsoError] = useState<string | undefined>()
  const [ssoSubmitting, setSsoSubmitting] = useState(false)

  const googleMutationProps = useMutationProps()
  const microsoftMutationProps = useMutationProps()

  const hasLocal = identities.some((i) => i.type === 'LOCAL')
  const hasGoogle = identities.some((i) => i.type === 'GOOGLE')
  const hasMicrosoft = identities.some((i) => i.type === 'MICROSOFT')
  const isSAML = identities.length === 0

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setPasswordError(undefined)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setPasswordError('Please enter your password')
      return
    }
    ReAuthWithPasswordMutation(atmosphere, {email, password}, (error) => {
      if (error) {
        setPasswordError(error)
      } else {
        onReAuthSuccess()
      }
    })
  }

  const handleGoogleReAuth = () => {
    GoogleClientManager.openReAuth(atmosphere, googleMutationProps, onReAuthSuccess)
  }

  const handleMicrosoftReAuth = () => {
    MicrosoftClientManager.openReAuth(atmosphere, microsoftMutationProps, onReAuthSuccess)
  }

  const handleSSOReAuth = async () => {
    setSsoError(undefined)
    setSsoSubmitting(true)
    const url = await getSAMLIdP(atmosphere, {email})
    if (!url) {
      setSsoError('SSO is not configured for this email address')
      setSsoSubmitting(false)
      return
    }
    const response = await loginSSO(url)
    setSsoSubmitting(false)
    if ('error' in response) {
      setSsoError(response.error)
    } else {
      onReAuthSuccess()
    }
  }

  const showDivider = (hasLocal || isSAML) && (hasGoogle || hasMicrosoft)

  return (
    <Fields>
      {hasLocal && (
        <form onSubmit={handlePasswordSubmit}>
          <FieldGroup>
            <Label>Email</Label>
            <UnderlineInput
              ariaLabel='Email'
              disabled
              error={undefined}
              name='email'
              onChange={() => {}}
              value={email}
            />
          </FieldGroup>
          <FieldGroup style={{marginTop: 8}}>
            <Label>Password</Label>
            <UnderlineInput
              ariaLabel='Password'
              autoComplete='current-password'
              autoFocus
              error={passwordError}
              name='password'
              onChange={handlePasswordChange}
              placeholder='********'
              type='password'
              value={password}
            />
          </FieldGroup>
          <div style={{marginTop: 16}}>
            <PrimaryButton size='medium' disabled={!password}>
              Verify Password
            </PrimaryButton>
          </div>
        </form>
      )}
      {isSAML && (
        <div>
          <FieldGroup>
            <Label>Email</Label>
            <UnderlineInput
              ariaLabel='Email'
              disabled
              error={undefined}
              name='email'
              onChange={() => {}}
              value={email}
            />
          </FieldGroup>
          <div style={{marginTop: 16}}>
            <PrimaryButton
              size='medium'
              onClick={handleSSOReAuth}
              waiting={ssoSubmitting}
              disabled={ssoSubmitting}
            >
              Sign in with SSO
            </PrimaryButton>
          </div>
          {ssoError && <ErrorMsg>{ssoError}</ErrorMsg>}
        </div>
      )}
      {showDivider && <Divider>or</Divider>}
      <ButtonGroup>
        {hasGoogle && (
          <div>
            <RaisedButton
              onClick={handleGoogleReAuth}
              waiting={googleMutationProps.submitting}
              className={cn(
                'h-10 w-60 justify-start px-4 disabled:opacity-100',
                googleMutationProps.submitting
                  ? 'bg-slate-300 text-slate-600'
                  : 'bg-white text-slate-700'
              )}
            >
              <img
                src={logo}
                className={cn(
                  'mx-4 h-[18px] w-[18px]',
                  googleMutationProps.submitting && 'contrast-0'
                )}
              />
              <div>Sign in with Google</div>
            </RaisedButton>
            {googleMutationProps.error && !googleMutationProps.submitting && (
              <ErrorMsg>{googleMutationProps.error.message}</ErrorMsg>
            )}
          </div>
        )}
        {hasMicrosoft && (
          <div>
            <RaisedButton
              onClick={handleMicrosoftReAuth}
              waiting={microsoftMutationProps.submitting}
              className={cn(
                'h-10 w-60 justify-start px-4 disabled:opacity-100',
                microsoftMutationProps.submitting
                  ? 'bg-slate-300 text-slate-600'
                  : 'bg-white text-slate-700'
              )}
            >
              <img
                src={microsoftLogo}
                className={cn(
                  'mx-4 h-[18px] w-[18px]',
                  microsoftMutationProps.submitting && 'saturate-0'
                )}
              />
              <div>Sign in with Microsoft</div>
            </RaisedButton>
            {microsoftMutationProps.error && !microsoftMutationProps.submitting && (
              <ErrorMsg>{microsoftMutationProps.error.message}</ErrorMsg>
            )}
          </div>
        )}
      </ButtonGroup>
    </Fields>
  )
}

export default DeleteAccountReAuthStep
