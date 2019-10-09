import React, {Component, Ref} from 'react'
import styled from '@emotion/styled'
import {RouteComponentProps, withRouter} from 'react-router'
import ErrorAlert from './ErrorAlert/ErrorAlert'
import PrimaryButton from './PrimaryButton'
import RaisedButton from './RaisedButton'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {CREATE_ACCOUNT_BUTTON_LABEL, SIGNIN_LABEL} from '../utils/constants'
import getAuthProviders from '../utils/getAuthProviders'
import {emailRegex} from '../validation/regex'
import withForm, {WithFormProps} from '../utils/relay/withForm'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Legitity from '../validation/Legitity'
import EmailInputField from './EmailInputField'
import PasswordInputField from './PasswordInputField'
import Auth0ClientManager from '../utils/Auth0ClientManager'
import getSAMLIdP from '../utils/getSAMLIdP'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import {LocalStorageKey} from '../types/constEnums'
import StyledTip from './StyledTip'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import getTokenFromSSO from '../utils/getTokenFromSSO'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV2'
import getSSODomainFromEmail from '../utils/getSSODomainFromEmail'
import Atmosphere from '../Atmosphere'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    WithFormProps,
    RouteComponentProps<{}> {
  email: string
  // is the primary login action (not secondary to Google Oauth)
  isPrimary?: boolean
  isSignin?: boolean
  existingAccount?: boolean
  fieldsRef?: Ref<any>
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
  color: PALETTE.LINK_BLUE,
  display: 'flex',
  fontSize: 14,
  justifyContent: 'center',
  marginTop: 16
})

interface State {
  isSSO: boolean
  pendingDomain: string | null
  ssoURL: string | null
  ssoDomain: string | null
}

const getSSOUrl = (atmosphere: Atmosphere, email: string) => {
  const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)
  const isInvited = !!invitationToken
  return getSAMLIdP(atmosphere, {email, isInvited})
}

// exporting as a Base is a good indicator that a parent component is using this as a ref
export class EmailPasswordAuthFormBase extends Component<Props, State> {
  state: State = {
    isSSO: false,
    pendingDomain: null,
    ssoURL: null,
    ssoDomain: null
  }

  componentDidUpdate(prevProps: Props) {
    const {location, onError} = this.props
    if (prevProps.location !== location && prevProps.error) {
      onError()
    }
  }

  handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const {atmosphere, fields} = this.props
    const {pendingDomain} = this.state
    const {name} = e.target
    this.props.setDirtyField(name)
    if (name === 'email') {
      const {value: email} = fields.email
      const domain = getSSODomainFromEmail(email)
      if (domain && domain !== pendingDomain) {
        this.setState({
          pendingDomain: domain
        })
        const url = await getSSOUrl(atmosphere, email)
        this.setState({
          ssoDomain: domain,
          ssoURL: url
        })
      }
    }
  }

  tryLogin = async (email: string, password: string, error?: string) => {
    const {atmosphere, onCompleted, onError} = this.props
    const manager = new Auth0ClientManager()
    const errorResult = await manager.login(email, password)
    if (!errorResult) {
      onCompleted()
      return
    }
    onError(error || errorResult.error_description)
    if (errorResult.error === 'access_denied') {
      const authProviders = await getAuthProviders(atmosphere, email)
      if (authProviders.length === 1 && authProviders[0] === 'google-oauth2') {
        onError('Sign in with Google above')
      }
    }
  }

  trySignUp = async (email, password) => {
    const {onError} = this.props
    const manager = new Auth0ClientManager()
    const res = await manager.signup(email, password)
    if ('code' in res) {
      const {code, description} = res
      if (code === 'user_exists') {
        // if they're trying to sign up & the user exists, see if the password is a match.
        // they may have just forgotten that they had an account
        await this.tryLogin(email, password, description)
      } else {
        // sentry will pick this up
        console.error(res)
        onError(description)
      }
      return
    }
    this.tryLogin(email, password).catch()
  }

  /*
   * Whenever the domain changes, we see if the domain belongs to an SSO account
   * if they submit before the check is returned, we send another check
   * if the domain is SSO, we redirect
   * else, we do a standard flow
   * */
  tryLoginWithSSO = async (email: string) => {
    const {atmosphere, submitMutation, onError, history, onCompleted} = this.props
    const {ssoDomain, ssoURL} = this.state
    const domain = getSSODomainFromEmail(email)!
    const url = domain === ssoDomain ? ssoURL : await getSSOUrl(atmosphere, email)
    if (!url) return false

    submitMutation()
    const {token, error} = await getTokenFromSSO(url)
    if (!token) {
      onError(error || 'Error logging in')
      return true
    }
    atmosphere.setAuthToken(token)
    const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)
    if (invitationToken) {
      localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted, onError})
    } else {
      const nextUrl = getValidRedirectParam() || '/me'
      history.push(nextUrl)
    }
    return true
  }

  toggleSSO = () => {
    this.setState({
      isSSO: !this.state.isSSO
    })
  }

  onSubmit = async (e: React.FormEvent) => {
    const {isSignin, submitMutation, submitting, validateField, setDirtyField} = this.props
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes, password: passwordRes} = validateField()
    if (emailRes.error) return
    const email = emailRes.value as string
    const isSSO = await this.tryLoginWithSSO(email)
    if (isSSO || passwordRes.error) return
    const password = passwordRes.value as string
    submitMutation()
    if (isSignin) {
      await this.tryLogin(email, password)
    } else {
      await this.trySignUp(email, password)
    }
  }

  render() {
    const {error, fields, isPrimary, isSignin, submitting, onChange, existingAccount} = this.props
    const {isSSO} = this.state
    const Button = isPrimary ? PrimaryButton : RaisedButton
    const hasEmail = !!fields.email.value
    return (
      <>
        <Form onSubmit={this.onSubmit}>
          {error && <ErrorAlert message={error as string} />}
          {!error && existingAccount && (
            <ErrorAlert message='Your account was created without Google. Sign in below' />
          )}
          {isSSO && submitting && <HelpMessage>Continue through the login popup</HelpMessage>}
          <FieldGroup>
            <FieldBlock>
              <EmailInputField
                autoFocus={!hasEmail}
                {...fields.email}
                onChange={onChange}
                onBlur={this.handleBlur}
              />
            </FieldBlock>
            <FieldBlock isSSO={isSSO}>
              <PasswordInputField
                autoFocus={hasEmail}
                {...fields.password}
                onChange={onChange}
                onBlur={this.handleBlur}
              />
            </FieldBlock>
          </FieldGroup>
          <Button size='medium' disabled={false} waiting={submitting}>
            {isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}
          </Button>
        </Form>
        <UseSSO onClick={this.toggleSSO}>{`Sign ${isSignin ? 'in' : 'up'} ${
          isSSO ? 'without' : 'with'
        } SSO`}</UseSSO>
      </>
    )
  }
}

const form = withForm({
  email: {
    getDefault: (props) => props.email,
    validate: (value) => {
      return new Legitity(value)
        .trim()
        .required('Please enter an email address')
        .matches(emailRegex, 'Please enter a valid email address')
    }
  },
  password: {
    getDefault: () => '',
    validate: (value) => new Legitity(value).required('Please enter a password')
  }
})

export default withAtmosphere(withMutationProps(withRouter(form(EmailPasswordAuthFormBase))))
