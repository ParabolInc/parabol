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
import getSAMLIdP from '../utils/getSAMLIdP'
import getSSODomainFromEmail from '../utils/getSSODomainFromEmail'
import getTokenFromSSO from '../utils/getTokenFromSSO'
import getValidRedirectParam from '../utils/getValidRedirectParam'
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
  const {isPrimary, isSignin, invitationToken, email, goToPage} = props
  const {location} = useRouter()
  const params = new URLSearchParams(location.search)
  const isSSODefault = Boolean(params.get('sso'))
  const [isSSO, setIsSSO] = useState(isSSODefault)
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
    setDirtyField(name)
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
    const url = domain === ssoDomain ? ssoURL : await getSSOUrl(atmosphere, email)
    if (!url) return false

    submitMutation()
    const {token, error} = await getTokenFromSSO(url)
    if (!token) {
      onError(new Error(error || 'Error logging in'))
      return true
    }
    atmosphere.setAuthToken(token)
    if (invitationToken) {
      localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted, onError})
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
    const email = emailRes.value as string
    const isSSO = await tryLoginWithSSO(email)
    if (isSSO || passwordRes.error) return
    const password = passwordRes.value as string
    submitMutation()
    if (isSignin) {
      LoginWithPasswordMutation(
        atmosphere,
        {email, password, invitationToken},
        {onError, onCompleted, history}
      )
    } else {
      const segmentId = getAnonymousId()
      SignUpWithPasswordMutation(
        atmosphere,
        {email, password, invitationToken, segmentId},
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
          <FieldBlock isSSO={isSSO}>
            <PasswordInputField
              autoFocus={hasEmail}
              {...fields.password}
              onChange={onChange}
              onBlur={handleBlur}
            />
          </FieldBlock>
        </FieldGroup>
        <Button size='medium' disabled={false} waiting={submitting}>
          {isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}
        </Button>
      </Form>
      <UseSSO onClick={toggleSSO}>{`Sign ${isSignin ? 'in' : 'up'} ${
        isSSO ? 'without' : 'with'
      } SSO`}</UseSSO>
    </>
  )
})

export default EmailPasswordAuthForm
