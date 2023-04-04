import styled from '@emotion/styled'
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import LoginWithPasswordMutation from '../mutations/LoginWithPasswordMutation'
import SignUpWithPasswordMutation from '../mutations/SignUpWithPasswordMutation'
import {PALETTE} from '../styles/paletteV3'
import {LocalStorageKey} from '../types/constEnums'
import {CREATE_ACCOUNT_BUTTON_LABEL, SIGNIN_LABEL} from '../utils/constants'
import getAnonymousId from '../utils/getAnonymousId'
import getOAuthPopupFeatures from '../utils/getOAuthPopupFeatures'
import getSAMLIdP from '../utils/getSAMLIdP'
import getSSODomainFromEmail from '../utils/getSSODomainFromEmail'
import getTokenFromSSO from '../utils/getTokenFromSSO'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import {emitGA4SignUpEvent} from '../utils/handleSuccessfulLogin'
import Legitity from '../validation/Legitity'
import {emailRegex} from '../validation/regex'
import EmailInputField from './EmailInputField'
import ErrorAlert from './ErrorAlert/ErrorAlert'
import {AuthPageSlug} from './GenericAuthentication'
import PasswordInputField from './PasswordInputField'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import RaisedButton from './RaisedButton'
import StyledTip from './StyledTip'

interface Props {
  email: string
  invitationToken: string | undefined | null
  // is the primary login action (not secondary to Google Oauth)
  isPrimary?: boolean
  isSignin?: boolean
  goToPage?: (page: AuthPageSlug, params: string) => void
}

const FieldGroup = styled('div')({
  margin: '16px 0'
})
const FieldBlock = styled('div')<{isSSO?: boolean}>(({isSSO}) => ({
  margin: '0 0 1.25rem',
  visibility: isSSO ? 'hidden' : undefined
}))

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 240,
  width: '100%'
})

const HelpMessage = styled(StyledTip)({
  paddingTop: 8,
  fontSize: 14
})

const UseSSO = styled(PlainButton)({
  color: PALETTE.SKY_500,
  display: 'flex',
  fontSize: 14,
  justifyContent: 'center',
  marginTop: 16
})

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
    .min(6, '6 character minimum')
    .max(1000, `That's a book, not a password`)
}

const EmailPasswordAuthForm = forwardRef((props: Props, ref: any) => {
  const isInternalAuthEnabled = window.__ACTION__.AUTH_INTERNAL_ENABLED
  const isSSOAuthEnabled = window.__ACTION__.AUTH_SSO_ENABLED

  const {isPrimary, isSignin, invitationToken, email, goToPage} = props
  const {location} = useRouter()
  const params = new URLSearchParams(location.search)
  const isSSODefault = isSSOAuthEnabled && Boolean(params.get('sso'))
  const signInWithSSOOnly = isSSOAuthEnabled && !isInternalAuthEnabled
  const [isSSO, setIsSSO] = useState(isSSODefault || signInWithSSOOnly)
  const [pendingDomain, setPendingDomain] = useState('')
  const [ssoURL, setSSOURL] = useState('')
  const [ssoDomain, setSSODomain] = useState('')
  const {submitMutation, onCompleted, submitting, error, onError} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {fields, onChange, setDirtyField, validateField} = useForm({
    email: {
      getDefault: () => email,
      validate: validateEmail
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
        const url = await getSSOUrl(atmosphere, email)
        setSSODomain(domain)
        setSSOURL(url || '')
      }
    }
  }

  const toggleSSO = () => {
    setIsSSO(!isSSO)
    if (isSSODefault && goToPage) {
      params.delete('sso')
      goToPage('signin', params.toString())
    }
  }

  const tryLoginWithSSO = async (email: string) => {
    const domain = getSSODomainFromEmail(email)!
    const validSSOURL = domain === ssoDomain && ssoURL
    const isProbablySSO = isSSO || !fields.password.value || validSSOURL
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
        getOAuthPopupFeatures({width: 385, height: 550, top: 64})
      )
    }
    const url = validSSOURL || (await getSSOUrl(atmosphere, email))
    if (!url) {
      optimisticPopup?.close()
      return false
    }
    submitMutation()
    const response = await getTokenFromSSO(url)
    if ('error' in response) {
      onError(new Error(response.error || 'Error logging in'))
      return true
    }
    const {token, ga4Args} = response
    atmosphere.setAuthToken(token)
    emitGA4SignUpEvent(ga4Args)
    if (invitationToken) {
      localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      AcceptTeamInvitationMutation(
        atmosphere,
        {invitationToken},
        {history, onCompleted, onError, ignoreApproval: true}
      )
    } else {
      const nextUrl = getValidRedirectParam() || '/meetings'
      history.push(nextUrl)
    }
    return true
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
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
    const {value: password} = passwordRes
    submitMutation()
    if (isSignin) {
      LoginWithPasswordMutation(
        atmosphere,
        {email, password, invitationToken: invitationToken || '', isInvitation: !!invitationToken},
        {onError, onCompleted, history}
      )
    } else {
      const segmentId = getAnonymousId()
      SignUpWithPasswordMutation(
        atmosphere,
        {
          email,
          password,
          invitationToken: invitationToken || '',
          isInvitation: !!invitationToken,
          segmentId
        },
        {
          onError,
          onCompleted,
          history
        }
      )
    }
  }

  const Button = isPrimary ? PrimaryButton : RaisedButton
  const hasEmail = !!fields.email.value
  return (
    <>
      <Form onSubmit={onSubmit}>
        {error && <ErrorAlert message={error.message} />}
        {isSSO && submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
        <FieldGroup>
          <FieldBlock>
            <EmailInputField
              autoFocus={!hasEmail}
              {...fields.email}
              onChange={onChange}
              onBlur={handleBlur}
            />
          </FieldBlock>
          {isInternalAuthEnabled && (
            <FieldBlock isSSO={isSSO}>
              <PasswordInputField
                autoFocus={hasEmail}
                {...fields.password}
                onChange={onChange}
                onBlur={handleBlur}
              />
            </FieldBlock>
          )}
        </FieldGroup>
        <Button size='medium' disabled={false} waiting={submitting}>
          {isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}
          {signInWithSSOOnly ? ' with SSO' : ''}
        </Button>
      </Form>
      {isSSOAuthEnabled && isInternalAuthEnabled && (
        <UseSSO onClick={toggleSSO}>
          {`Sign ${isSignin ? 'in' : 'up'} ${isSSO ? 'without' : 'with'} SSO`}
        </UseSSO>
      )}
    </>
  )
})

export default EmailPasswordAuthForm
