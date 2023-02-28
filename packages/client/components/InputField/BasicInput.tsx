import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import makeFieldColorPalette from '../../styles/helpers/makeFieldColorPalette'
import ui from '../../styles/ui'
import StyledError from '../StyledError'

const Input = styled('input')<{disabled: boolean}>(
  ({disabled}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('white', !disabled)
  }),
  ({disabled}) => disabled && {...ui.fieldDisabled}
)

const Error = styled(StyledError)({
  fontSize: 13,
  textAlign: 'left',
  width: '100%'
})

interface Props {
  autoComplete?: 'off'
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  error: string | undefined
  name: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
    placeholder,
    spellCheck,
    type = 'text',
    value,
    readOnly
  } = props
  return (
    <React.Fragment>
      <Input
        readOnly={readOnly}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={className}
        disabled={Boolean(disabled)}
        ref={ref}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        spellCheck={spellCheck}
        type={type}
        value={value}
      />
      {error && <Error>{error}</Error>}
    </React.Fragment>
  )
})

export default BasicInput
