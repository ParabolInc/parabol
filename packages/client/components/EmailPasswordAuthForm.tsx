import type * as React from 'react'
import {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import {useLocation, useNavigate} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import LoginWithPasswordMutation from '../mutations/LoginWithPasswordMutation'
import SignUpWithPasswordMutation from '../mutations/SignUpWithPasswordMutation'
import {passwordStrength} from '../shared/passwordStrength'
import {LocalStorageKey, Security} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import {CREATE_ACCOUNT_BUTTON_LABEL, SIGNIN_LABEL} from '../utils/constants'
import getAnonymousId from '../utils/getAnonymousId'
import getOAuthPopupFeatures from '../utils/getOAuthPopupFeatures'
import getSAMLIdP from '../utils/getSAMLIdP'
import getSSODomainFromEmail from '../utils/getSSODomainFromEmail'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import {emitGA4SignUpEvent} from '../utils/handleSuccessfulLogin'
import loginSSO from '../utils/loginSSO'
import Legitity from '../validation/Legitity'
import {emailRegex} from '../validation/regex'
import EmailInputField from './EmailInputField'
import ErrorAlert from './ErrorAlert/ErrorAlert'
import type {AuthPageSlug} from './GenericAuthentication'
import PasswordInputField from './PasswordInputField'
import PlainButton from './PlainButton/PlainButton'
import StyledTip from './StyledTip'

interface Props {
  // used to determine the coordinates of the auth popup
  getOffsetTop?: () => number
  email: string
  invitationToken: string | undefined | null
  // is the primary login action (not secondary to Google Oauth)
  isPrimary?: boolean
  isSignin?: boolean
  goToPage?: (page: AuthPageSlug, params: string) => void
}

const getSSOUrl = (atmosphere: Atmosphere, email: string) => {
  const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)
  const isInvited = !!invitationToken
  return getSAMLIdP(atmosphere, {email, isInvited})
}

const validateEmail = (email: string) => {
  return new Legitity(email)
    .trim()
    .required('Please enter an email address')
    .matches(emailRegex, 'Please enter a valid email address')
}

const validatePassword = (password: string) => {
  return new Legitity(password)
    .required('Please enter a password')
    .min(Security.MIN_PASSWORD_LENGTH, `${Security.MIN_PASSWORD_LENGTH} character minimum`)
    .max(1000, `That's a book, not a password`)
}

const EmailPasswordAuthForm = forwardRef((props: Props, ref: any) => {
  const isInternalAuthEnabled = window.__ACTION__.AUTH_INTERNAL_ENABLED
  const isSSOAuthEnabled = window.__ACTION__.AUTH_SSO_ENABLED
  const isGoogleAuthEnabled = window.__ACTION__.AUTH_GOOGLE_ENABLED
  const isMicrosoftAuthEnabled = window.__ACTION__.AUTH_MICROSOFT_ENABLED
  const isSingleTenantSSO =
    isSSOAuthEnabled && !isGoogleAuthEnabled && !isMicrosoftAuthEnabled && !isInternalAuthEnabled
  const {getOffsetTop, isPrimary, isSignin, invitationToken, email, goToPage} = props
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isSSODefault = isSSOAuthEnabled && Boolean(params.get('sso'))
  const signInWithSSOOnly = isSSOAuthEnabled && !isInternalAuthEnabled
  const [isSSO, setIsSSO] = useState(isSSODefault || signInWithSSOOnly)
  const [ssoMessage, setSSOMessage] = useState('')
  const [pendingDomain, setPendingDomain] = useState('')
  const [ssoDomain, setSSODomain] = useState<string>()
  const {submitMutation, onCompleted, submitting, error, onError} = useMutationProps()
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {fields, onChange, setDirtyField, validateField} = useForm({
    email: {
      getDefault: () => email,
      validate: signInWithSSOOnly ? undefined : validateEmail
    },
    password: {
      getDefault: () => '',
      validate: isSignin ? undefined : validatePassword
    }
  })

  useImperativeHandle(ref, () => ({
    email: () => encodeURIComponent(fields.email.value)
  }))

  useEffect(() => {
    onCompleted()
  }, [location])

  useEffect(() => {
    if (!isSingleTenantSSO) return
    const attemptLogin = async () => {
      const url = await getSSOUrl(atmosphere, email)
      if (url) {
        window.location.href = url
      }
    }
    attemptLogin()
  }, [isSingleTenantSSO])

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const {name} = e.target
    if (name === 'email' || name === 'password') {
      setDirtyField(name)
    }
    if (name === 'email') {
      const {value: email} = fields.email
      const domain = getSSODomainFromEmail(email)
      if (domain && domain !== pendingDomain) {
        setPendingDomain(domain)
        // Fetch the url to verify SSO is configured for this domain.
        // Don't cache it as we need a fresh one for login
        const url = await getSSOUrl(atmosphere, email)
        setSSODomain(url ? domain : undefined)
        // hide the password field if it's SSO to avoid confusion
        if (url && !isSSO) {
          setIsSSO(true)
          // easiest way to reset the message is on each isSSO change, so wait till that happened for the line above and set it after
          setTimeout(() => setSSOMessage('Your Organization requires SSO'), 0)
        }
      }
    }
  }
  useEffect(() => {
    setSSOMessage('')
  }, [isSSO])

  const toggleSSO = () => {
    setIsSSO(!isSSO)
    if (isSSODefault && goToPage) {
      params.delete('sso')
      goToPage('signin', params.toString())
    }
  }

  const tryLoginWithSSO = async (email: string) => {
    const domain = getSSODomainFromEmail(email)!
    const hadValidSSOURL = domain === ssoDomain
    const isProbablySSO = isSSO || !fields.password.value || hadValidSSOURL
    const top = getOffsetTop?.() || 56
    let optimisticPopup
    if (isProbablySSO) {
      // Safari blocks all calls to window.open that are not triggered SYNCHRONOUSLY from an event
      // To mitigate that, we open a window synchronously and change the URL asynchronously
      // https://stackoverflow.com/a/39387533

      // Only 1 case where this is a false positive:
      // 1. Enter a valid SSO email address
      // 2. Type in a password
      // 3. Go back to the email & change it to a non-SSO email
      // 4. submit without blurring the email input
      optimisticPopup = window.open(
        '',
        'SSO',
        getOAuthPopupFeatures({width: 385, height: 576, top})
      )
    }
    const url = await getSSOUrl(atmosphere, email)
    if (!url) {
      optimisticPopup?.close()
      return false
    }
    submitMutation()
    const response = await loginSSO(url, top)
    if ('error' in response) {
      onError(new Error(response.error || 'Error logging in'))
      return true
    }
    const {ga4Args} = response
    commitLocalUpdate(atmosphere, (store) => {
      const root = store.getRoot()
      root.setValue(ga4Args.isNewUser, 'isNewUser')
    })
    emitGA4SignUpEvent(ga4Args)
    if (invitationToken) {
      localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      AcceptTeamInvitationMutation(
        atmosphere,
        {invitationToken},
        {navigate, onCompleted, onError, ignoreApproval: true}
      )
    } else {
      const nextUrl = getValidRedirectParam() || '/meetings'
      navigate(nextUrl)
    }
    return true
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    onCompleted()
    setDirtyField()
    const {email: emailRes, password: passwordRes} = validateField()
    if (emailRes.error) return
    const {value: email} = emailRes
    const signInWithSSOSucceeded = await tryLoginWithSSO(email)
    if (isSSO && !signInWithSSOSucceeded) {
      onError(new Error('This domain is not configured for SSO. Please contact support@parabol.co'))
      return
    }
    if (signInWithSSOSucceeded || passwordRes.error) return
    const strengthError = passwordStrength(passwordRes.value, email)
    if (strengthError) {
      fields.password.setError(strengthError)
      return
    }
    const {value: password} = passwordRes
    submitMutation()
    if (isSignin) {
      LoginWithPasswordMutation(
        atmosphere,
        {
          email,
          password,
          invitationToken: invitationToken || '',
          isInvitation: !!invitationToken
        },
        {onError, onCompleted, navigate}
      )
    } else {
      const pseudoId = await getAnonymousId()
      SignUpWithPasswordMutation(
        atmosphere,
        {
          email,
          password,
          invitationToken: invitationToken || '',
          isInvitation: !!invitationToken,
          pseudoId,
          params: location.search
        },
        {
          onError,
          onCompleted,
          navigate
        }
      )
    }
  }

  const hasEmail = !!fields.email.value
  const submitLabel = `${isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}${
    signInWithSSOOnly ? ' with SSO' : ''
  }`
  return (
    <>
      <form className='flex w-full max-w-60 flex-col' onSubmit={onSubmit}>
        {error && <ErrorAlert message={error.message} />}
        {isSSO && submitting && (
          <StyledTip className='pt-2 text-[14px]'>Continue through the login popup</StyledTip>
        )}
        <div className={cn('relative', signInWithSSOOnly ? 'hidden' : 'mt-4 mb-4')}>
          <div className={cn('mb-5', signInWithSSOOnly && 'invisible')}>
            <EmailInputField
              autoFocus={!hasEmail}
              {...fields.email}
              onChange={onChange}
              onBlur={handleBlur}
            />
          </div>
          {ssoMessage && (
            <div className='absolute w-full text-center font-medium text-sm'>{ssoMessage}</div>
          )}
          {isInternalAuthEnabled && (
            <div className={cn('mb-5', isSSO && 'invisible')}>
              <PasswordInputField
                autoFocus={hasEmail}
                {...fields.password}
                onChange={onChange}
                onBlur={handleBlur}
              />
            </div>
          )}
        </div>
        {isPrimary ? (
          <Button variant='primary' size='md' disabled={submitting}>
            {submitLabel}
          </Button>
        ) : (
          <Button
            variant='raised'
            size='md'
            className='bg-slate-200 text-slate-700'
            disabled={submitting}
          >
            {submitLabel}
          </Button>
        )}
      </form>
      {isSSOAuthEnabled && isInternalAuthEnabled && (
        <PlainButton
          className='mt-4 flex justify-center text-[14px] text-accent'
          onClick={toggleSSO}
        >
          {`Sign ${isSignin ? 'in' : 'up'} ${isSSO ? 'without' : 'with'} SSO`}
        </PlainButton>
      )}
    </>
  )
})

export default EmailPasswordAuthForm
