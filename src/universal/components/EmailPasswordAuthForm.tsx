import React, {Component} from 'react'
import styled from 'react-emotion'
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert'
import PrimaryButton from 'universal/components/PrimaryButton'
import auth0CreateAccountWithEmail from 'universal/utils/auth0CreateAccountWithEmail'
import auth0LoginWithEmail from 'universal/utils/auth0LoginWithEmail'
import {CREATE_ACCOUNT_BUTTON_LABEL, SIGNIN_LABEL} from 'universal/utils/constants'
import {emailRegex} from 'universal/validation/regex'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Legitity from '../validation/Legitity'
import EmailInputField from './EmailInputField'
import PasswordInputField from './PasswordInputField'

interface Props {
  email: string
  isSignin?: boolean
}

type FieldName = 'email' | 'password'
const DEFAULT_FIELD = {value: '', error: undefined, dirty: false}

interface Props extends WithMutationProps {}

const FieldGroup = styled('div')({
  margin: '1rem 0 1rem'
})
const FieldBlock = styled('div')({
  margin: '0 0 1.5rem'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 240,
  width: '100%'
})

class EmailPasswordAuthForm extends Component<Props> {
  state = {
    fields: {
      email: {
        ...DEFAULT_FIELD,
        value: this.props.email
      },
      password: {...DEFAULT_FIELD}
    }
  }
  validate = (name: FieldName) => {
    const validators = {
      email: this.validateEmail,
      password: this.validatePassword
    }
    const res: Legitity = validators[name]()

    const {fields} = this.state
    const field = fields[name]
    if (res.error !== field.error) {
      this.setState({
        fields: {
          ...fields,
          [name]: {
            ...field,
            error: res.error
          }
        }
      })
    }
    return res
  }

  validateEmail = () => {
    const {fields} = this.state
    const rawEmail = fields.email.value
    return new Legitity(rawEmail)
      .trim()
      .required('Please enter an email address')
      .matches(emailRegex, 'Please enter a valid email address')
  }

  validatePassword = () => {
    const {fields} = this.state
    const rawPassword = fields.password.value
    return new Legitity(rawPassword).required('Please enter a password')
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.setDirty(e.target.name as FieldName)
  }

  setDirty = (name: FieldName) => {
    const {fields} = this.state
    const field = fields[name]
    if (!field.dirty) {
      this.setState({
        fields: {
          ...fields,
          [name]: {
            ...field,
            dirty: true
          }
        }
      })
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {fields} = this.state
    const {value} = e.target
    const name = e.target.name as FieldName
    const field = fields[name]
    this.setState(
      {
        fields: {
          ...fields,
          [name]: {
            ...field,
            value
          }
        }
      },
      () => {
        this.validate(name)
      }
    )
  }

  tryLogin = async (email: string, password: string, handleError?: () => void) => {
    const {onCompleted, onError} = this.props
    try {
      await auth0LoginWithEmail(email, password)
      onCompleted()
    } catch (e) {
      onError(e.error_description || e.description || e.message)
      // use the handler's error message, if any
      handleError && handleError()
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
    const {isSignin, submitMutation, submitting} = this.props
    e.preventDefault()
    if (submitting) return
    const fieldNames: Array<FieldName> = ['email', 'password']
    fieldNames.forEach(this.setDirty)
    const fieldRes = fieldNames.map(this.validate)
    const hasError = fieldRes.reduce((err: boolean, val) => err || !!val.error, false)
    if (hasError) return
    const [emailRes, passwordRes] = fieldRes
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
    const {fields} = this.state
    const {error, isSignin, submitting} = this.props
    return (
      <Form className='create-account-form' onSubmit={this.onSubmit}>
        {error && <ErrorAlert message={error} />}
        <FieldGroup>
          <FieldBlock>
            <EmailInputField
              {...fields.email}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
            />
          </FieldBlock>
          <FieldBlock>
            <PasswordInputField
              {...fields.password}
              autoFocus
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
            />
          </FieldBlock>
        </FieldGroup>
        <PrimaryButton size='large' disabled={false} waiting={submitting}>
          {isSignin ? SIGNIN_LABEL : CREATE_ACCOUNT_BUTTON_LABEL}
        </PrimaryButton>
      </Form>
    )
  }
}

export default withMutationProps(EmailPasswordAuthForm)
