import React, {Component} from 'react'
import styled from 'react-emotion'
import PrimaryButton from 'universal/components/PrimaryButton'
import auth0LoginWithEmail from 'universal/utils/auth0LoginWithEmail'
import {emailRegex} from 'universal/validation/regex'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Legitity from '../validation/Legitity'
import EmailInputField from './EmailInputField'
import PasswordInputField from './PasswordInputField'
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert'

interface Props {
  email: string
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
  flexDirection: 'column'
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

  onSubmit = async (e: React.FormEvent) => {
    const {onError, onCompleted, submitMutation, submitting} = this.props
    e.preventDefault()
    if (submitting) return
    const fieldNames: Array<FieldName> = ['email', 'password']
    fieldNames.forEach(this.setDirty)
    const fieldRes = fieldNames.map(this.validate)
    const hasError = fieldRes.reduce((err: boolean, val) => err || !!val.error, false)
    if (hasError) return
    const [emailRes, passwordRes] = fieldRes
    submitMutation()
    let res
    try {
      res = await auth0LoginWithEmail(emailRes.value, passwordRes.value)
    } catch (e) {
      onError(e.error_description)
      return
    }
    alert(res)
    console.log('RES', res)
    onCompleted()
  }

  render () {
    const {fields} = this.state
    const {error, submitting} = this.props
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
          {'Sign in'}
        </PrimaryButton>
      </Form>
    )
  }
}
export default withMutationProps(EmailPasswordAuthForm)
