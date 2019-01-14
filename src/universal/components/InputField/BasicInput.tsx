import React from 'react'
import styled from 'react-emotion'
import StyledError from 'universal/components/StyledError'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'

const Input = styled('input')(
  ({disabled}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('gray', !disabled)
  }),
  ({disabled}: {disabled: boolean}) => disabled && {...ui.fieldDisabled}
)

interface Props {
  autoFocus?: boolean
  disabled?: boolean
  error: string | undefined
  innerRef?: React.RefObject<HTMLInputElement>
  name?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
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
    type = 'text',
    value
  } = props
  return (
    <React.Fragment>
      <Input
        autoFocus={autoFocus}
        disabled={Boolean(disabled)}
        innerRef={innerRef}
        name={name}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error && <StyledError>{error}</StyledError>}
    </React.Fragment>
  )
}

export default BasicInput
