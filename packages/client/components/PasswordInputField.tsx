import * as React from 'react'
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

const PasswordInputField = (props: Props) => {
  const {autoFocus, dirty, error, onChange, onBlur, value} = props
  return (
    <React.Fragment>
      <TinyLabel className='font-semibold text-[12px]'>Password</TinyLabel>
      <UnderlineInput
        ariaLabel={'Password'}
        autoComplete='current-password'
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
