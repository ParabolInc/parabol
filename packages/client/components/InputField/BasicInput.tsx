import * as React from 'react'
import {forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'
import StyledError from '../StyledError'

interface Props {
  autoComplete?: 'off' | 'new-password'
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  error: string | undefined
  name: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  spellCheck?: boolean
  type?: string
  value: string
  readOnly?: boolean
}

const BasicInput = forwardRef((props: Props, ref: Ref<HTMLInputElement>) => {
  const {
    autoComplete,
    autoFocus,
    className,
    disabled,
    error,
    name,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    placeholder,
    spellCheck,
    type = 'text',
    value,
    readOnly
  } = props
  return (
    <React.Fragment>
      <input
        readOnly={readOnly}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(
          'm-0 block w-full appearance-none rounded-[4px] border border-hairline-field bg-surface-input px-[11px] py-[7px] font-sans text-[15px] text-fg-primary leading-6 outline-none selection:bg-hairline-strong placeholder:text-fg-muted',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-fg-primary focus:border-fg-primary active:border-fg-primary',
          className
        )}
        disabled={Boolean(disabled)}
        ref={ref}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        spellCheck={spellCheck}
        type={type}
        value={value}
      />
      {error && <StyledError className='w-full text-[13px]'>{error}</StyledError>}
    </React.Fragment>
  )
})

export default BasicInput
