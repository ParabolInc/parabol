import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import StyledError from '../StyledError'
import makeFieldColorPalette from '../../styles/helpers/makeFieldColorPalette'
import ui from '../../styles/ui'

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
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  name: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  spellCheck?: boolean
  type?: string
  value: string
}

const BasicInput = forwardRef((props: Props, ref: Ref<HTMLInputElement>) => {
  const {
    autoFocus,
    disabled,
    error,
    name,
    onBlur,
    onChange,
    placeholder,
    spellCheck,
    type = 'text',
    value
  } = props
  return (
    <React.Fragment>
      <Input
        autoFocus={autoFocus}
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
