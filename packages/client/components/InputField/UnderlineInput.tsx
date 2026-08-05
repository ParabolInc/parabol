import * as React from 'react'
import {forwardRef, type Ref} from 'react'
import StyledError from '../StyledError'

interface Props {
  ariaLabel: string
  autoComplete?: string
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  name?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  value: string
}

const UnderlineInput = forwardRef((props: Props, ref: Ref<HTMLInputElement>) => {
  const {
    ariaLabel,
    autoComplete,
    autoFocus,
    disabled,
    error,
    name,
    onBlur,
    onChange,
    placeholder,
    type = 'text',
    value
  } = props
  return (
    <React.Fragment>
      <input
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={Boolean(disabled)}
        ref={ref}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        type={type}
        value={value}
        className='m-0 block w-full appearance-none rounded-none border-0 border-hairline-field border-b py-[5px] pr-4 pl-0 font-sans text-[14px] text-fg-primary leading-[1.375rem] shadow-none outline-0 hover:border-accent-active focus:border-accent-active active:border-accent-active'
      />
      {error && <StyledError className='mt-2 text-[13px]'>{error}</StyledError>}
    </React.Fragment>
  )
})

export default UnderlineInput
