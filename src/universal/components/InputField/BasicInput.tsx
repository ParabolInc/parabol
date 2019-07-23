import React from 'react'
import styled from '@emotion/styled'
import StyledError from 'universal/components/StyledError'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'

const Input = styled('input')<{disabled: boolean}>(
  ({disabled}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('gray', !disabled)
  }),
  ({disabled}) => disabled && {...ui.fieldDisabled}
)

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  innerRef?: React.RefObject<HTMLInputElement>
  name: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  spellCheck?: boolean
  type?: string
  value: string
}

const BasicInput = (props: Props) => {
  const {
    autoFocus,
    disabled,
    error,
    innerRef,
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
        ref={innerRef}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        spellCheck={spellCheck}
        type={type}
        value={value}
      />
      {error && <StyledError>{error}</StyledError>}
    </React.Fragment>
  )
}

export default BasicInput
