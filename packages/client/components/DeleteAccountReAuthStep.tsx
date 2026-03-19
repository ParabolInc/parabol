import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {DeleteAccountReAuthStep_viewer$key} from '../__generated__/DeleteAccountReAuthStep_viewer.graphql'
import useMutationProps from '../hooks/useMutationProps'
import ReAuthWithPasswordMutation from '../mutations/ReAuthWithPasswordMutation'
import logo from '../styles/theme/images/graphics/google.svg'
import microsoftLogo from '../styles/theme/images/graphics/microsoft.svg'
import {AuthIdentityTypeEnum} from '../types/constEnums'
import {cn} from '../ui/cn'
import GoogleClientManager from '../utils/GoogleClientManager'
import loginSSO from '../utils/loginSSO'
import MicrosoftClientManager from '../utils/MicrosoftClientManager'
import UnderlineInput from './InputField/UnderlineInput'
import PrimaryButton from './PrimaryButton'
import RaisedButton from './RaisedButton'
import StyledError from './StyledError'

interface Props {
  viewerRef: DeleteAccountReAuthStep_viewer$key
  onReAuthSuccess: () => void
}

const DeleteAccountReAuthStep = ({viewerRef, onReAuthSuccess}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment DeleteAccountReAuthStep_viewer on User {
        email
        identities {
          type
        }
        samlIdP
      }
    `,
    viewerRef
  )
  const {email, identities, samlIdP} = viewer
  const atmosphere = useAtmosphere()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [ssoError, setSsoError] = useState<string | undefined>()
  const [ssoSubmitting, setSsoSubmitting] = useState(false)

  const googleMutationProps = useMutationProps()
  const microsoftMutationProps = useMutationProps()

  const hasLocal = identities?.some((i) => i?.type === AuthIdentityTypeEnum.LOCAL)
  const hasGoogle = identities?.some((i) => i?.type === AuthIdentityTypeEnum.GOOGLE)
  const hasMicrosoft = identities?.some((i) => i?.type === AuthIdentityTypeEnum.MICROSOFT)

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
    if (!samlIdP) return
    setSsoError(undefined)
    setSsoSubmitting(true)
    const response = await loginSSO(samlIdP)
    setSsoSubmitting(false)
    if ('error' in response) {
      setSsoError(response.error)
    } else {
      onReAuthSuccess()
    }
  }

  // If the org has SAML configured, all auth goes through SSO
  if (samlIdP) {
    return (
      <div className='flex w-full max-w-[240px] flex-col items-stretch gap-4'>
        <PrimaryButton
          size='medium'
          onClick={handleSSOReAuth}
          waiting={ssoSubmitting}
          disabled={ssoSubmitting}
          className='w-full'
        >
          Sign in with SSO
        </PrimaryButton>
        {ssoError && <StyledError className='mt-2 text-[.8125rem]'>{ssoError}</StyledError>}
      </div>
    )
  }

  const showDivider = hasLocal && (hasGoogle || hasMicrosoft)

  return (
    <div className='flex w-full max-w-[240px] flex-col items-stretch gap-4'>
      {hasLocal && (
        <form onSubmit={handlePasswordSubmit}>
          <div className='flex flex-col gap-1'>
            <label className='font-semibold text-[11px] text-slate-600'>Password</label>
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
          </div>
          <PrimaryButton size='medium' disabled={!password} className='mt-5 w-full'>
            Verify Password
          </PrimaryButton>
        </form>
      )}
      {showDivider && <div className='my-1 text-center text-slate-400 text-xs'>or</div>}
      <div className='flex flex-col items-start gap-2'>
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
              <StyledError className='mt-2 text-[.8125rem]'>
                {googleMutationProps.error.message}
              </StyledError>
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
              <StyledError className='mt-2 text-[.8125rem]'>
                {microsoftMutationProps.error.message}
              </StyledError>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeleteAccountReAuthStep
