import React from 'react'
import styled from 'react-emotion'
import UnderlineInput from './InputField/UnderlineInput'

interface Props {
  autoFocus?: boolean
  dirty: boolean
  error: string | undefined
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}

const Label = styled('label')({
  fontSize: '.875rem'
})
const PasswordInputField = (props: Props) => {
  const {autoFocus, dirty, error, onChange, onBlur, value} = props
  return (
    <React.Fragment>
      <Label>Password</Label>
      <UnderlineInput
        autoFocus={autoFocus}
        error={dirty ? (error as string) : undefined}
        name='password'
        onBlur={onBlur}
        onChange={onChange}
        placeholder='********'
        type='password'
        value={value}
      />
    </React.Fragment>
  )
}

export default PasswordInputField
