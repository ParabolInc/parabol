/**
 * The form used for signing in via email/password.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth'
import React from 'react'
import styled from 'react-emotion'
import {Link} from 'react-router-dom'
import {Field, reduxForm} from 'redux-form'
import RaisedButton from 'universal/components/RaisedButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import shouldValidate from 'universal/validation/shouldValidate'
import appTheme from 'universal/styles/theme/appTheme'
import InputField from 'universal/components/InputField/InputField'
import {SIGNIN_LABEL} from 'universal/utils/constants'
import {authButtonWidth} from 'universal/styles/auth'

type Props = {
  handleSubmit: () => void, // Provided by redux-form
  onSubmit: (Credentials) => Promise<any>, // Provided by clients of the exported component
  submitting: boolean,
  valid: boolean
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const Block = styled('div')(({margin, width}) => ({margin, width}))

const linkColor = {
  color: appTheme.brand.secondary.blue
}

const linkStyles = {
  ...linkColor,
  ':hover': {...linkColor, textDecoration: 'underline'},
  marginTop: '1rem',
  textAlign: 'center'
}

const ForgotPasswordLink = styled(Link)({
  ...linkStyles,
  fontSize: '.875rem',
  lineHeight: '1.5rem'
})

const SignInEmailPasswordForm = (props: Props) => {
  const {handleSubmit, submitting, valid} = props
  return (
    <Form className='signin-form' onSubmit={handleSubmit}>
      <Block margin='1rem 0 2rem' width={authButtonWidth}>
        <Block margin='0 0 1.5rem'>
          <Field
            type='email'
            autoFocus
            component={InputField}
            fieldSize='medium'
            placeholder='you@company.co'
            label='Email:'
            name='email'
            underline
            disabled={submitting}
          />
        </Block>
        <Field
          type='password'
          component={InputField}
          fieldSize='medium'
          placeholder='********'
          label='Password:'
          name='password'
          underline
          disabled={submitting}
        />
      </Block>
      <RaisedButton size='medium' disabled={!valid} waiting={submitting}>
        {SIGNIN_LABEL}
      </RaisedButton>
      <ForgotPasswordLink to='/reset-password'>{'Forgot your password?'}</ForgotPasswordLink>
    </Form>
  )
}

const validate = (values) => {
  const validation = {}
  if (!parseEmailAddressList(values.email)) {
    validation.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    validation.password = 'Enter a password.'
  }
  return validation
}

export default reduxForm({form: 'signin', shouldValidate, validate})(SignInEmailPasswordForm)
