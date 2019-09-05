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

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    WithFormProps,
    RouteComponentProps<{}> {
  email: string
  // is the primary login action (not secondary to Google Oauth)
  isPrimary?: boolean
  isSignin?: boolean
  isSSO: boolean
  existingAccount?: boolean
  fieldsRef?: Ref<any>
}

const FieldGroup = styled('div')({
  margin: '1rem 0 1rem'
})
const FieldBlock = styled('div')({
  margin: '0 0 1.25rem'
})

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

// exporting as a Base is a good indicator that a parent component is using this as a ref
export class EmailPasswordAuthFormBase extends Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const {location, onError} = this.props
    if (prevProps.location !== location && prevProps.error) {
      onError()
    }
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.setDirtyField(e.target.name)
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

  loginWithSSO = async (email) => {
    const {atmosphere, submitMutation, onError, history, onCompleted} = this.props
    submitMutation()
    const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)
    const isInvited = !!invitationToken
    const url = await getSAMLIdP(atmosphere, {email, isInvited})
    if (!url) {
      onError('Email not found')
      return
    }
    let token
    try {
      token = await getTokenFromSSO(url)
    } catch(e) {
      onError('Error connecting to Identity Provider. Try again later')
      return
    }
    if (!token) {
      onError('Error logging in! Did you close the popup window?')
      return
    }
    atmosphere.setAuthToken(token)
    if (invitationToken) {
      localStorage.removeItem(LocalStorageKey.INVITATION_TOKEN)
      AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted, onError})
    } else {
      const nextUrl = getValidRedirectParam() || '/me'
      history.push(nextUrl)
    }
  }

  onSubmit = async (e: React.FormEvent) => {
    const {isSignin, submitMutation, submitting, validateField, setDirtyField, isSSO} = this.props
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes, password: passwordRes} = validateField()
    if (emailRes.error) return
    const email = emailRes.value as string
    if (isSSO) {
      await this.loginWithSSO(email)
      return
    }
    if (passwordRes.error) return
    const password = passwordRes.value as string
    submitMutation()
    if (isSignin) {
      await this.tryLogin(email, password)
    } else {
      await this.trySignUp(email, password)
    }
  }

  render() {
    const {error, fields, isPrimary, isSignin, isSSO, submitting, onChange, existingAccount} = this.props
    const Button = isPrimary ? PrimaryButton : RaisedButton
    const hasEmail = !!fields.email.value
    return (
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
          {!isSSO && <FieldBlock>
            <PasswordInputField
              autoFocus={hasEmail}
              {...fields.password}
              onChange={onChange}
              onBlur={this.handleBlur}
            />
          </FieldBlock>}
        </FieldGroup>
        <Button size='medium' disabled={false} waiting={submitting}>
          {isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}
        </Button>
      </Form>
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
