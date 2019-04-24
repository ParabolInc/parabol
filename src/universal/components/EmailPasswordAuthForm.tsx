import React, {Component} from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router'
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert'
import PrimaryButton from 'universal/components/PrimaryButton'
import RaisedButton from 'universal/components/RaisedButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import auth0CreateAccountWithEmail from 'universal/utils/auth0CreateAccountWithEmail'
import auth0LoginWithEmail from 'universal/utils/auth0LoginWithEmail'
import {CREATE_ACCOUNT_BUTTON_LABEL, SIGNIN_LABEL} from 'universal/utils/constants'
import getAuthProviders from 'universal/utils/getAuthProviders'
import {emailRegex} from 'universal/validation/regex'
import withForm, {WithFormProps} from '../utils/relay/withForm'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Legitity from '../validation/Legitity'
import EmailInputField from './EmailInputField'
import PasswordInputField from './PasswordInputField'

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

// exporting as a Base is a good indicator that a parent component is using this as a ref
export class EmailPasswordAuthFormBase extends Component<Props> {
  componentDidUpdate (prevProps: Props) {
    const {location, onError} = this.props
    if (prevProps.location !== location && prevProps.error) {
      onError()
    }
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.setDirtyField(e.target.name)
  }

  tryLogin = async (email: string, password: string, handleError?: () => void) => {
    const {atmosphere, onCompleted, onError} = this.props
    try {
      await auth0LoginWithEmail(email, password)
      onCompleted()
    } catch (e) {
      onError(e.error_description || e.description || e.message)
      // use the handler's error message, if any
      handleError && handleError()
      if (e.code === 'access_denied') {
        const authProviders = await getAuthProviders(atmosphere, email)
        if (authProviders.length === 1 && authProviders[0] === 'google-oauth2') {
          onError('Sign in with Google above')
        }
      }
    }
  }

  trySignUp = async (email, password) => {
    const {onError} = this.props
    try {
      await auth0CreateAccountWithEmail(email, password)
    } catch (e) {
      const handleError = () => {
        onError(e.error_description || e.description || e.message)
      }
      if (e.code === 'user_exists') {
        // if they're trying to sign up & the user exists, see if the password is a match.
        // they may have just forgotten that they had an account
        await this.tryLogin(email, password, handleError)
      } else {
        handleError()
      }
      return
    }
    this.tryLogin(email, password).catch()
  }

  onSubmit = async (e: React.FormEvent) => {
    const {isSignin, submitMutation, submitting, validateField, setDirtyField} = this.props
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes, password: passwordRes} = validateField()
    if (emailRes.error || passwordRes.error) return
    const email = emailRes.value as string
    const password = passwordRes.value as string
    submitMutation()
    if (isSignin) {
      await this.tryLogin(email, password)
    } else {
      await this.trySignUp(email, password)
    }
  }

  render () {
    const {error, fields, isPrimary, isSignin, submitting, onChange, existingAccount} = this.props
    const Button = isPrimary ? PrimaryButton : RaisedButton
    const hasEmail = !!fields.email.value
    return (
      <Form onSubmit={this.onSubmit}>
        {error && <ErrorAlert message={error} />}
        {!error && existingAccount && (
          <ErrorAlert message='Your account was created without Google. Sign in below' />
        )}
        <FieldGroup>
          <FieldBlock>
            <EmailInputField
              autoFocus={!hasEmail}
              {...fields.email}
              onChange={onChange}
              onBlur={this.handleBlur}
            />
          </FieldBlock>
          <FieldBlock>
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
