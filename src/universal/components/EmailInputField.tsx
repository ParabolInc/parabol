import React from 'react'
import styled from 'react-emotion'
import UnderlineInput from './InputField/UnderlineInput'

interface Props {
  dirty: boolean
  error: string | undefined
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}

const Label = styled('label')({
  fontSize: '.875rem'
})
const EmailInputField = (props: Props) => {
  const {dirty, error, onChange, onBlur, value} = props
  return (
    <React.Fragment>
      <Label>Email</Label>
      <UnderlineInput
        error={dirty ? (error as string) : undefined}
        name='email'
        onBlur={onBlur}
        onChange={onChange}
        placeholder='you@company.co'
        value={value}
      />
    </React.Fragment>
  )
}

export default EmailInputField
