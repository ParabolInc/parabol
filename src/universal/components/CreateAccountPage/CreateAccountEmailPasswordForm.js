/**
 * The form used for signing up via email/password.
 *
 * @flow
 */
import type {Credentials} from 'universal/types/auth'
import React from 'react'
import styled from 'react-emotion'
import {Field, reduxForm} from 'redux-form'
import PrimaryButton from 'universal/components/PrimaryButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import shouldValidate from 'universal/validation/shouldValidate'
import InputField from 'universal/components/InputField/InputField'
import {CREATE_ACCOUNT_BUTTON_LABEL} from 'universal/utils/constants'
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

const SignInEmailPasswordForm = (props: Props) => {
  const {handleSubmit, submitting, valid} = props
  return (
    <Form className='create-account-form' onSubmit={handleSubmit}>
      <Block margin='1rem 0 2rem' width={authButtonWidth}>
        <Block margin='0 0 1.5rem'>
          <Field
            autoFocus
            component={InputField}
            fieldSize='large'
            type='email'
            placeholder='you@company.co'
            label='Email:'
            name='email'
            underline
            disabled={submitting}
          />
        </Block>
        <Field
          component={InputField}
          fieldSize='large'
          type='password'
          placeholder='********'
          label='Password:'
          name='password'
          underline
          disabled={submitting}
        />
      </Block>
      <PrimaryButton size='large' depth={1} disabled={!valid} waiting={submitting}>
        {CREATE_ACCOUNT_BUTTON_LABEL}
      </PrimaryButton>
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

export default reduxForm({form: 'create-account', shouldValidate, validate})(
  SignInEmailPasswordForm
)
