/**
 * The form used to reset a password.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import {Field, reduxForm} from 'redux-form'
import PrimaryButton from 'universal/components/PrimaryButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import shouldValidate from 'universal/validation/shouldValidate'
import InputField from 'universal/components/InputField/InputField'
import {authButtonWidth} from 'universal/styles/auth'

type Props = {
  handleSubmit: () => void, // from redux-form
  onSubmit: ({email: string}) => Promise<any>, // from parents of this component
  submitting: boolean,
  valid: boolean
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const Block = styled('div')({
  margin: '2rem 0 3rem',
  width: authButtonWidth
})

const PasswordResetForm = (props: Props) => {
  const {handleSubmit, submitting, valid} = props
  return (
    <Form onSubmit={handleSubmit}>
      <Block>
        <Field
          type='email'
          autoFocus
          component={InputField}
          fieldSize='large'
          placeholder='you@company.co'
          label='Email:'
          name='email'
          underline
          disabled={submitting}
        />
      </Block>
      <PrimaryButton size='large' disabled={!valid} waiting={submitting}>
        {'Submit'}
      </PrimaryButton>
    </Form>
  )
}

const validate = ({email}) => ({
  email: parseEmailAddressList(email) ? null : 'Enter a valid email address'
})

export default reduxForm({form: 'passwordReset', shouldValidate, validate})(PasswordResetForm)
