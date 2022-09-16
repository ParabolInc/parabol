import styled from '@emotion/styled'
import React from 'react'
import UnderlineInput from './InputField/UnderlineInput'
import TinyLabel from './TinyLabel'

interface Props {
  autoFocus?: boolean
  dirty: boolean
  error: string | undefined
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}

const Label = styled(TinyLabel)({
  fontSize: 12,
  fontWeight: 600
})

const EmailInputField = (props: Props) => {
  const {autoFocus, dirty, error, onChange, onBlur, value} = props
  return (
    <React.Fragment>
      <Label>Email</Label>
      <UnderlineInput
        ariaLabel={'Email'}
        autoFocus={autoFocus}
        error={dirty ? (error as string) : undefined}
        name='email'
        onBlur={onBlur}
        onChange={onChange}
        placeholder='you@company.co'
        type={'email'}
        value={value}
      />
    </React.Fragment>
  )
}

export default EmailInputField
