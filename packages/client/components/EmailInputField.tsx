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

const EmailInputField = (props: Props) => {
  const {autoFocus, dirty, error, onChange, onBlur, value} = props
  return (
    <React.Fragment>
      {/* classes, not styled(TinyLabel): an Emotion override can't beat TinyLabel's own
          Tailwind text size, but tailwind-merge resolves this against its text-[11px].
          Arbitrary 12px rather than text-xs, which would also impose a 16px leading the
          original styled(TinyLabel) never set. */}
      <TinyLabel className='font-semibold text-[12px]'>Email</TinyLabel>
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
